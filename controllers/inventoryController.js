const db = require("../db/queries");

// Display all inventory items
async function getInventory(req, res) {
  try {
    const clothing = await db.getAllInventory();
    res.render("inventory", {
      clothing: clothing,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.render("inventory", {
      clothing: [],
    });
  }
}

// Display all categories with statistics
async function getCategories(req, res) {
  try {
    const categories = await db.getAllCategories();
    res.render("categories", {
      categories: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.render("categories", {
      categories: [],
    });
  }
}

// Display items in a specific category
async function getCategoryItems(req, res) {
  try {
    const categoryName = req.params.category;
    const items = await db.getItemsByCategory(categoryName);
    res.render("category", {
      categoryName: categoryName,
      items: items,
    });
  } catch (error) {
    console.error("Error fetching category items:", error);
    res.render("category", {
      categoryName: req.params.category,
      items: [],
    });
  }
}

// Display single item details
async function getItemDetails(req, res) {
  try {
    const itemId = req.params.id;
    const item = await db.getItemById(itemId);
    
    if (!item) {
      return res.status(404).render("error", { 
        message: "Item not found",
        error: { status: 404 }
      });
    }

    // Get related items (same category, different item)
    const relatedItems = await db.getRelatedItems(item.type, itemId);
    
    res.render("item", {
      item: item,
      relatedItems: relatedItems,
    });
  } catch (error) {
    console.error("Error fetching item details:", error);
    res.status(500).render("error", { 
      message: "Error loading item details",
      error: error
    });
  }
}

module.exports = {
  getInventory,
  getCategories,
  getCategoryItems,
  getItemDetails,
};