const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/', customerController.getProducts);
router.get('/search', customerController.searchProducts);
router.get('/product/:id', customerController.getProductDetails);
router.get('/cart', ensureAuthenticated, customerController.getCart);
router.post('/cart/add', ensureAuthenticated, customerController.postAddToCart);
router.post('/cart/remove', ensureAuthenticated, customerController.postRemoveFromCart);
router.get('/checkout', ensureAuthenticated, customerController.getCheckout);
router.post('/order', ensureAuthenticated, customerController.postOrder);
router.get('/orders', ensureAuthenticated, customerController.getOrderHistory);
router.get('/invoice/:id', ensureAuthenticated, customerController.getInvoice);
router.post('/review/:productId', ensureAuthenticated, customerController.postReview);
router.get('/review/edit/:id', ensureAuthenticated, customerController.getEditReview);
router.post('/review/edit/:id', ensureAuthenticated, customerController.postEditReview);
router.post('/review/delete/:id', ensureAuthenticated, customerController.deleteReview);
router.post('/review/helpful/:id', ensureAuthenticated, customerController.markHelpful);
router.post('/wishlist/:id', ensureAuthenticated, customerController.toggleWishlist);
router.get('/wishlist', ensureAuthenticated, customerController.getWishlist);
router.post('/apply-coupon', ensureAuthenticated, customerController.applyCoupon);
router.post('/create-razorpay-order', ensureAuthenticated, customerController.createRazorpayOrder);

module.exports = router;
