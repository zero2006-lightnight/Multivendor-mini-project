
const crypto = require('crypto');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const aiRecommendations = require('../services/aiRecommendations');
const aiSearch = require('../services/aiSearch');

let razorpay = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
} catch (err) {
    console.error('Razorpay init error:', err.message);
}

// Email transporter (uses Ethereal test account if no SMTP configured)
let emailTransporter = null;
const initEmailTransporter = async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
    } else {
        const testAccount = await nodemailer.createTestAccount();
        emailTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass }
        });
    }
};
initEmailTransporter().catch(err => console.error('Email init error:', err));

const sendOrderConfirmationEmail = async (order, user) => {
    if (!emailTransporter) return;
    try {
        // Look up product names for the email
        const productIds = order.products.map(p => p.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p.name; });
        const productList = order.products.map(p => `  - ${productMap[p.product.toString()] || 'Product'} x${p.quantity} @ ₹${p.price}`).join('\n');
        const info = await emailTransporter.sendMail({
            from: process.env.SMTP_FROM || 'Marketplace <no-reply@marketplace.com>',
            to: user.email,
            subject: `Order Confirmation - #${order._id}`,
            text: `Hi ${user.username},\n\nYour order #${order._id} has been placed successfully!\n\nItems:\n${productList}\n\nTotal: ₹${order.totalAmount.toFixed(2)}\nStatus: ${order.status}\n\nThank you for shopping with us!`,
            html: `<h2>Order Confirmation</h2><p>Hi ${user.username},</p><p>Your order <strong>#${order._id}</strong> has been placed successfully!</p><p><strong>Total:</strong> ₹${order.totalAmount.toFixed(2)}<br><strong>Status:</strong> ${order.status}</p><p>Thank you for shopping with us!</p>`
        });
        console.log('Order confirmation email sent:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Failed to send order email:', error.message);
    }
};

const sendVendorOrderNotification = async (order, vendorUser) => {
    if (!emailTransporter || !vendorUser) return;
    try {
        await emailTransporter.sendMail({
            from: process.env.SMTP_FROM || 'Marketplace <no-reply@marketplace.com>',
            to: vendorUser.email,
            subject: `New Order Received - #${order._id}`,
            text: `You have a new order!\n\nOrder ID: #${order._id}\nTotal: ₹${order.totalAmount.toFixed(2)}\n\nLog in to your vendor dashboard for details.`,
            html: `<h2>New Order Received</h2><p>You have a new order!</p><p><strong>Order ID:</strong> #${order._id}<br><strong>Total:</strong> ₹${order.totalAmount.toFixed(2)}</p><p>Log in to your vendor dashboard for details.</p>`
        });
    } catch (error) {
        console.error('Failed to send vendor notification:', error.message);
    }
};



const getCart = (session) => {
    session.cart = session.cart || { products: [], totalAmount: 0 };
    return session.cart;
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const categories = (await Product.distinct('category')).sort();
        const trending = await aiRecommendations.getTrendingProducts(6);
        res.render('customer/index', { products, categories, trending, search: '', category: '', minPrice: '', maxPrice: '' });
    } catch (error) {
        console.error('getProducts (homepage) error:', error);
        res.status(500).send('Server Error');
    }
};

exports.getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor', 'shopName');
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/');
        }

        let sortOption = {};
        if (req.query.sort === 'highest') sortOption = { rating: -1 };
        else if (req.query.sort === 'lowest') sortOption = { rating: 1 };
        else if (req.query.sort === 'oldest') sortOption = { createdAt: 1 };
        else sortOption = { createdAt: -1 };

        const reviews = await Review.find({ product: req.params.id })
            .populate('user').sort(sortOption);

        let averageRating = 0;
        const reviewCount = reviews.length;
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => { ratingDistribution[review.rating]++; });
        if (reviews.length > 0) {
            averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
        }

        // AI Recommendations
        const similarProducts = await aiRecommendations.getSimilarProducts(req.params.id, 4);
        const alsoBoughtProducts = await aiRecommendations.getCustomersAlsoBought(req.params.id, 4);

        res.render('customer/product-details', {
            product, reviews, averageRating, reviewCount, ratingDistribution,
            user: req.user, currentSort: req.query.sort || 'latest',
            similarProducts, alsoBoughtProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getCart = async (req, res) => {
    const cart = getCart(req.session);

    const coupons = await Coupon.find();

    let finalTotal = cart.totalAmount;

    if (req.session.discount) {
        finalTotal =
            cart.totalAmount -
            (cart.totalAmount * req.session.discount) / 100;
    }

    res.render('customer/cart', {
        cart,
        coupons,
        discount: req.session.discount || 0,
        finalTotal
    });
};

exports.postAddToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = getCart(req.session);

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        const qty = parseInt(quantity, 10);

        if (qty < 1) {
            req.flash('error_msg', 'Invalid quantity');
            return res.redirect('back');
        }

        // Check stock availability
        const existingItem = cart.products.find(p => p.product._id.toString() === productId);
        const currentCartQty = existingItem ? existingItem.quantity : 0;
        const requestedTotal = currentCartQty + qty;

        if (requestedTotal > product.stock) {
            req.flash('error_msg', `Only ${product.stock} items available in stock`);
            return res.redirect('back');
        }

        const existingProductIndex = cart.products.findIndex(p => p.product._id.toString() === productId);

        if (existingProductIndex > -1) {
            cart.products[existingProductIndex].quantity += qty;
        } else {
            cart.products.push({ product, quantity: qty });
        }

        cart.totalAmount += product.price * qty;
        req.session.cart = cart;
        res.redirect('/cart');
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

exports.postRemoveFromCart = (req, res) => {
    const { productId } = req.body;
    const cart = getCart(req.session);
    
    const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
    if (productIndex > -1) {
        const item = cart.products[productIndex];
        cart.totalAmount -= item.product.price * item.quantity;
        cart.products.splice(productIndex, 1);
    }
    
    req.session.cart = cart;
    res.redirect('/cart');
};

exports.getCheckout = (req, res) => {
    const cart = getCart(req.session);

    let finalTotal = cart.totalAmount;

    if (req.session.discount) {
        finalTotal =
            cart.totalAmount -
            (cart.totalAmount * req.session.discount) / 100;
    }

    res.render('customer/checkout', {
    cart,
    finalTotal,
    discount: req.session.discount || 0,
    razorpayKey: process.env.RAZORPAY_KEY_ID
});
};

exports.postOrder = async (req, res) => {
    const cart = getCart(req.session);
    const { street, city, state, zipCode, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (cart.products.length === 0) {
        return res.redirect('/');
    }

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        req.flash('error_msg', 'Payment information missing');
        return res.redirect('/checkout');
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            req.flash('error_msg', 'Payment verification failed');
            return res.redirect('/checkout');
        }
        // Validate stock for all items before creating order
        for (const item of cart.products) {
            const product = await Product.findById(item.product._id);
            if (!product || product.stock < item.quantity) {
                req.flash('error_msg', `Insufficient stock for ${product ? product.name : 'a product'}`);
                return res.redirect('/cart');
            }
        }

        const orderProducts = cart.products.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }));

        let finalTotal = cart.totalAmount;
        let discountPct = 0;
        let couponCode = null;

        if (req.session.discount) {
            discountPct = req.session.discount;
            finalTotal = cart.totalAmount - (cart.totalAmount * discountPct) / 100;
            couponCode = req.session.appliedCoupon || null;
        }

        const newOrder = new Order({
            customer: req.user.id,
            products: orderProducts,
            totalAmount: finalTotal,
            status: 'Paid',
            shippingAddress: { street, city, state, zipCode },
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
            couponCode,
            discount: discountPct
        });

        await newOrder.save();

        // Reduce stock for each product
        for (const item of cart.products) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        req.session.cart = null;
        req.session.discount = null;
        req.session.appliedCoupon = null;

        // Send email notifications (non-blocking)
        sendOrderConfirmationEmail(newOrder, req.user).catch(err => console.error('Email error:', err));

        // Notify vendors whose products were in this order
        const vendorIds = [...new Set(cart.products.map(item => item.product.vendor ? item.product.vendor.toString() : null).filter(Boolean))];
        for (const vendorId of vendorIds) {
            const vendorUser = await User.findById(vendorId).select('username email');
            sendVendorOrderNotification(newOrder, vendorUser).catch(err => console.error('Vendor email error:', err));
        }

        req.flash('success_msg', 'Order placed successfully!');
        res.redirect('/orders');
    } catch (error) {
        console.error('POST ORDER ERROR:', error);
        res.status(500).send('Server Error');
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id }).populate('products.product');
        res.render('customer/order-history', { orders });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};
exports.searchProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice } = req.query;

        // Use AI-enhanced search with synonym matching and relevance ranking
        const products = await aiSearch.enhancedSearch({ search, category, minPrice, maxPrice });
        const categories = (await Product.distinct('category')).sort();
        res.render('customer/index', { products, categories, search, category, minPrice, maxPrice, trending: [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
exports.postReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const existingReview = await Review.findOne({
            product: req.params.productId,
            user: req.user._id
        });

        if (existingReview) {
            req.flash('error_msg', 'You have already reviewed this product');
            return res.redirect(`/product/${req.params.productId}`);
        }

        const validRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

        await Review.create({
            product: req.params.productId,
            user: req.user._id,
            rating: validRating,
            comment: comment ? comment.trim() : ''
        });

        req.flash('success_msg', 'Review added successfully!');
        res.redirect(`/product/${req.params.productId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.getEditReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            req.flash('error_msg', 'Review not found');
            return res.redirect('back');
        }
        if (review.user.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('back');
        }
        res.render('customer/edit-review', { review });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.postEditReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            req.flash('error_msg', 'Review not found');
            return res.redirect('back');
        }
        if (review.user.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('back');
        }

        const { rating, comment } = req.body;
        review.rating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
        review.comment = comment ? comment.trim() : '';
        await review.save();

        req.flash('success_msg', 'Review updated successfully!');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.redirect('back');
        }
        if (review.user.toString() !== req.user._id.toString()) {
            return res.redirect('back');
        }
        await Review.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Review deleted successfully');
        res.redirect('back');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.markHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.redirect('back');
        }
        const userId = req.user._id;
        const op = review.helpfulUsers.includes(userId) ? '$pull' : '$addToSet';
        await Review.findByIdAndUpdate(req.params.id, { [op]: { helpfulUsers: userId } });
        res.redirect('back');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.toggleWishlist = async (req, res) => {
    try {
        const productId = req.params.id;
        const user = await User.findById(req.user._id);
        const exists = user.wishlist.some(id => id.toString() === productId);
        if (exists) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        } else {
            user.wishlist.push(productId);
        }
        await user.save();
        req.flash('success_msg', 'Wishlist updated successfully');
        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.render('customer/wishlist', { products: user.wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code || code.trim().length === 0) {
            req.flash('error_msg', 'Please enter a coupon code');
            return res.redirect('/cart');
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

        if (!coupon) {
            req.flash('error_msg', 'Invalid coupon code');
            return res.redirect('/cart');
        }

        if (!coupon.isActive) {
            req.flash('error_msg', 'This coupon is no longer active');
            return res.redirect('/cart');
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            req.flash('error_msg', 'This coupon has expired');
            return res.redirect('/cart');
        }

        if (coupon.discount < 0 || coupon.discount > 100) {
            req.flash('error_msg', 'Invalid coupon discount');
            return res.redirect('/cart');
        }

        req.session.discount = coupon.discount;
        req.session.appliedCoupon = coupon.code;

        req.flash('success_msg', `Coupon Applied (${coupon.discount}% OFF)`);
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.getInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'username email')
            .populate('products.product', 'name price');

        if (!order) {
            req.flash('error_msg', 'Order not found');
            return res.redirect('/orders');
        }

        // Only the customer who placed the order can view the invoice
        if (order.customer._id.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/orders');
        }

        res.render('customer/invoice', { order, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.createRazorpayOrder = async (req, res) => {
    try {
        const cart = getCart(req.session);

        if (!cart.products || cart.products.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        let amount = cart.totalAmount;

        if (req.session.discount) {
            amount =
                cart.totalAmount -
                (cart.totalAmount * req.session.discount) / 100;
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Order total must be greater than zero' });
        }

        if (amount < 1) {
            amount = 1;
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: "receipt_" + Date.now()
        };

        if (!razorpay) {
            return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
        }
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay order creation error:', error.description || error.message || error);
        res.status(500).json({ success: false, message: 'Order creation failed' });
    }
};