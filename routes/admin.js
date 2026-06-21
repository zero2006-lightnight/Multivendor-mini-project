const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Dashboard
router.get('/dashboard', ensureAuthenticated, isAdmin, adminController.getDashboard);

// User Management
router.get('/users', ensureAuthenticated, isAdmin, adminController.getUsers);
router.post('/users/delete/:id', ensureAuthenticated, isAdmin, adminController.deleteUser);

// Product Management
router.get('/products', ensureAuthenticated, isAdmin, adminController.getProducts);
router.post('/products/delete/:id', ensureAuthenticated, isAdmin, adminController.deleteProduct);

// Order Management
router.get('/orders', ensureAuthenticated, isAdmin, adminController.getOrders);
router.post('/orders/update-status/:id', ensureAuthenticated, isAdmin, adminController.updateOrderStatus);

// Analytics
router.get('/analytics', ensureAuthenticated, isAdmin, adminController.getAnalytics);

module.exports = router;
