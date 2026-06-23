const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Helper to clean up uploaded file on error
const cleanupFile = (req) => {
    if (req.file) {
        const p = path.join(__dirname, '..', req.file.path);
        if (fs.existsSync(p)) fs.unlinkSync(p);
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.user.id });
        res.render('vendor/dashboard', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getAddProduct = (req, res) => {
    res.render('vendor/add-product');
};

exports.postAddProduct = async (req, res) => {
    const { name, description, price, category, stock, imageUrl } = req.body;
    try {
        const priceNum = parseFloat(price);
        const stockNum = parseInt(stock, 10);
        if (isNaN(priceNum) || priceNum < 0 || isNaN(stockNum) || stockNum < 0) {
            cleanupFile(req);
            req.flash('error_msg', 'Invalid price or stock value');
            return res.redirect('back');
        }
        const imageData = req.file ? `/uploads/products/${req.file.filename}` : (imageUrl || null);
        if (!imageData) {
            cleanupFile(req);
            req.flash('error_msg', 'Please provide an image (upload or URL)');
            return res.redirect('back');
        }
        const newProduct = new Product({
            name,
            description,
            price: priceNum,
            category,
            stock: stockNum,
            image: imageData,
            vendor: req.user.id
        });
        await newProduct.save();
        req.flash('success_msg', 'Product added successfully!');
        res.redirect('/vendor/dashboard');
    } catch (error) {
        cleanupFile(req);
        console.error(error);
        req.flash('error_msg', 'Failed to add product');
        res.redirect('back');
    }
};

exports.getEditProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/vendor/dashboard');
        }
        if (product.vendor.toString() !== req.user.id) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/vendor/dashboard');
        }
        res.render('vendor/edit-product', { product });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.postEditProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            cleanupFile(req);
            req.flash('error_msg', 'Product not found');
            return res.redirect('/vendor/dashboard');
        }
        if (product.vendor.toString() !== req.user.id) {
            cleanupFile(req);
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/vendor/dashboard');
        }

        const { name, description, price, category, stock, imageUrl } = req.body;
        const priceNum = parseFloat(price);
        const stockNum = parseInt(stock, 10);
        if (isNaN(priceNum) || priceNum < 0 || isNaN(stockNum) || stockNum < 0) {
            cleanupFile(req);
            req.flash('error_msg', 'Invalid price or stock value');
            return res.redirect('back');
        }

        const updateData = {
            name,
            description,
            price: priceNum,
            category,
            stock: stockNum
        };

        // Handle image update
        if (req.file) {
            // Delete old local image if exists
            if (product.image && product.image.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', product.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.image = `/uploads/products/${req.file.filename}`;
        } else if (imageUrl && imageUrl !== product.image) {
            // Delete old local image if switching to URL
            if (product.image && product.image.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', product.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.image = imageUrl;
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        req.flash('success_msg', 'Product updated successfully!');
        res.redirect('/vendor/dashboard');
    } catch (error) {
        cleanupFile(req);
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/vendor/dashboard');
        }
        if (product.vendor.toString() !== req.user.id) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/vendor/dashboard');
        }
        // Delete associated image file
        if (product.image) {
            const imgPath = path.join(__dirname, '..', product.image);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Product deleted successfully!');
        res.redirect('/vendor/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Vendor Order Management
exports.getOrders = async (req, res) => {
    try {
        const vendorProducts = await Product.find({ vendor: req.user.id }).select('_id');
        const vendorProductIds = vendorProducts.map(p => p._id);

        const orders = await Order.find({
            'products.product': { $in: vendorProductIds }
        })
        .populate('customer', 'username email')
        .populate('products.product', 'name price vendor')
        .sort({ createdAt: -1 });

        const vendorOrders = orders.map(order => {
            const vendorItems = order.products.filter(item =>
                vendorProductIds.some(vpId => vpId.toString() === item.product._id.toString())
            );
            const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return {
                ...order.toObject(),
                vendorItems,
                vendorTotal
            };
        });

        res.render('vendor/orders', { orders: vendorOrders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
