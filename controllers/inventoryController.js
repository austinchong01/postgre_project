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
        error: { status: 404 },
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
      error: error,
    });
  }
}

// Display form for creating a new item
async function getCreateForm(req, res) {
  try {
    // Get existing types for the dropdown
    const existingTypes = await db.getExistingTypes();
    res.render("create", {
      item: null,
      existingTypes: existingTypes,
      errors: [],
    });
  } catch (error) {
    console.error("Error loading create form:", error);
    res.render("create", {
      item: null,
      existingTypes: [],
      errors: ["Error loading form data"],
    });
  }
}

// Handle creating a new item
async function createItem(req, res) {
  try {
    const { name, type, size, color, price } = req.body;
    const errors = [];

    // Validation
    if (!name || name.trim().length === 0) {
      errors.push("Name is required");
    }
    if (!type || type.trim().length === 0) {
      errors.push("Type is required");
    }
    if (!size || size.trim().length === 0) {
      errors.push("Size is required");
    }
    if (!color || color.trim().length === 0) {
      errors.push("Color is required");
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      errors.push("Price must be a positive number");
    }

    if (errors.length > 0) {
      const existingTypes = await db.getExistingTypes();
      return res.render("create", {
        item: { name, type, size, color, price },
        existingTypes: existingTypes,
        errors: errors,
      });
    }

    // Create the item
    const newItem = await db.createItem({
      name: name.trim(),
      type: type.trim(),
      size: size.trim(),
      color: color.trim(),
      price: parseFloat(price),
    });

    res.redirect(`/item/${newItem.id}`);
  } catch (error) {
    console.error("Error creating item:", error);
    const existingTypes = await db.getExistingTypes();
    res.render("create", {
      item: req.body,
      existingTypes: existingTypes,
      errors: ["Error creating item. Please try again."],
    });
  }
}

// Display form for editing an existing item
async function getEditForm(req, res) {
  try {
    const itemId = req.params.id;
    const item = await db.getItemById(itemId);

    if (!item) {
      return res.status(404).render("error", {
        message: "Item not found",
        error: { status: 404 },
      });
    }

    const existingTypes = await db.getExistingTypes();
    res.render("edit", {
      item: item,
      existingTypes: existingTypes,
      errors: [],
    });
  } catch (error) {
    console.error("Error loading edit form:", error);
    res.status(500).render("error", {
      message: "Error loading edit form",
      error: error,
    });
  }
}

// Handle updating an existing item
async function updateItem(req, res) {
  try {
    const itemId = req.params.id;
    const { name, type, size, color, price } = req.body;
    const errors = [];

    // Validation
    if (!name || name.trim().length === 0) {
      errors.push("Name is required");
    }
    if (!type || type.trim().length === 0) {
      errors.push("Type is required");
    }
    if (!size || size.trim().length === 0) {
      errors.push("Size is required");
    }
    if (!color || color.trim().length === 0) {
      errors.push("Color is required");
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      errors.push("Price must be a positive number");
    }

    if (errors.length > 0) {
      const existingTypes = await db.getExistingTypes();
      return res.render("edit", {
        item: { id: itemId, name, type, size, color, price },
        existingTypes: existingTypes,
        errors: errors,
      });
    }

    // Update the item
    const updatedItem = await db.updateItem(itemId, {
      name: name.trim(),
      type: type.trim(),
      size: size.trim(),
      color: color.trim(),
      price: parseFloat(price),
    });

    if (!updatedItem) {
      return res.status(404).render("error", {
        message: "Item not found",
        error: { status: 404 },
      });
    }

    res.redirect(`/item/${itemId}`);
  } catch (error) {
    console.error("Error updating item:", error);
    const existingTypes = await db.getExistingTypes();
    res.render("edit", {
      item: { id: req.params.id, ...req.body },
      existingTypes: existingTypes,
      errors: ["Error updating item. Please try again."],
    });
  }
}

// Handle deleting an item
async function deleteItem(req, res) {
  try {
    const itemId = req.params.id;
    const deletedItem = await db.deleteItem(itemId);

    if (!deletedItem) {
      return res.status(404).render("error", {
        message: "Item not found",
        error: { status: 404 },
      });
    }

    // Redirect to the category page or inventory if category is empty
    try {
      const categoryItems = await db.getItemsByCategory(deletedItem.type);
      if (categoryItems.length > 0) {
        res.redirect(`/category/${encodeURIComponent(deletedItem.type)}`);
      } else {
        res.redirect("/");
      }
    } catch (error) {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).render("error", {
      message: "Error deleting item",
      error: error,
    });
  }
}

module.exports = {
  getInventory,
  getCategories,
  getCategoryItems,
  getItemDetails,
  getCreateForm,
  createItem,
  getEditForm,
  updateItem,
  deleteItem,
};
