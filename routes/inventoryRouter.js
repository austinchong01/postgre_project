const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// READ routes - Display views

// Home page - show all inventory items
router.get('/', inventoryController.getInventory);

// Categories page - show all categories with statistics
router.get('/categories', inventoryController.getCategories);

// Category page - show items in a specific category  
router.get('/category/:category', inventoryController.getCategoryItems);

// Item details page - show single item with full details
router.get('/item/:id', inventoryController.getItemDetails);

// CREATE routes

// Display form for creating a new item
router.get('/create', inventoryController.getCreateForm);

// Handle creating a new item
router.post('/create', inventoryController.createItem);

// UPDATE routes

// Display form for editing an existing item
router.get('/item/:id/edit', inventoryController.getEditForm);

// Handle updating an existing item
router.post('/item/:id/edit', inventoryController.updateItem);

// DELETE routes

// Handle deleting an item
router.post('/item/:id/delete', inventoryController.deleteItem);

module.exports = router;