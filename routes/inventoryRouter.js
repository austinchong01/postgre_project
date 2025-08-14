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

module.exports = router;