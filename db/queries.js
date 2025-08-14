const pool = require("./pool");

// Get all inventory items
async function getAllInventory() {
  const { rows } = await pool.query("SELECT * FROM clothing ORDER BY created_at DESC");
  return rows;
}

// Get all categories with statistics and recent items
async function getAllCategories() {
  try {
    // Get category statistics
    const { rows: categoryStats } = await pool.query(`
      SELECT 
        type,
        COUNT(*) as count,
        MIN(price::numeric) as minPrice,
        MAX(price::numeric) as maxPrice,
        COUNT(DISTINCT size) as sizes
      FROM clothing 
      GROUP BY type 
      ORDER BY count DESC
    `);

    // Get recent items for each category
    const categories = [];
    for (const stat of categoryStats) {
      const { rows: recentItems } = await pool.query(`
        SELECT * FROM clothing 
        WHERE type = $1 
        ORDER BY created_at DESC 
        LIMIT 3
      `, [stat.type]);

      categories.push({
        type: stat.type,
        count: parseInt(stat.count),
        minPrice: parseFloat(stat.minprice).toFixed(2),
        maxPrice: parseFloat(stat.maxprice).toFixed(2),
        sizes: parseInt(stat.sizes),
        recentItems: recentItems
      });
    }

    return categories;
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return [];
  }
}

// Get all items in a specific category
async function getItemsByCategory(categoryName) {
  const { rows } = await pool.query(
    "SELECT * FROM clothing WHERE type = $1 ORDER BY created_at DESC",
    [categoryName]
  );
  return rows;
}

// Get a single item by ID
async function getItemById(itemId) {
  const { rows } = await pool.query(
    "SELECT * FROM clothing WHERE id = $1",
    [itemId]
  );
  return rows[0]; // Return the first (and should be only) result
}

// Get related items (same category, different item, limit 6)
async function getRelatedItems(itemType, excludeId) {
  const { rows } = await pool.query(
    "SELECT * FROM clothing WHERE type = $1 AND id != $2 ORDER BY created_at DESC LIMIT 6",
    [itemType, excludeId]
  );
  return rows;
}

// Get existing types for dropdown options
async function getExistingTypes() {
  const { rows } = await pool.query(
    "SELECT DISTINCT type FROM clothing ORDER BY type"
  );
  return rows.map(row => row.type);
}

// Create a new item
async function createItem(itemData) {
  const { name, type, size, color, price } = itemData;
  const { rows } = await pool.query(
    "INSERT INTO clothing (name, type, size, color, price) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, type, size, color, price]
  );
  return rows[0];
}

// Update an existing item
async function updateItem(itemId, itemData) {
  const { name, type, size, color, price } = itemData;
  const { rows } = await pool.query(
    "UPDATE clothing SET name = $1, type = $2, size = $3, color = $4, price = $5 WHERE id = $6 RETURNING *",
    [name, type, size, color, price, itemId]
  );
  return rows[0];
}

// Delete an item
async function deleteItem(itemId) {
  const { rows } = await pool.query(
    "DELETE FROM clothing WHERE id = $1 RETURNING *",
    [itemId]
  );
  return rows[0];
}

module.exports = {
  getAllInventory,
  getAllCategories,
  getItemsByCategory,
  getItemById,
  getRelatedItems,
  getExistingTypes,
  createItem,
  updateItem,
  deleteItem,
};