const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Admin Dashboard with quick stats
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.render('admin/dashboard', {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// User Management
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.render('admin/manage-users', { users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'User deleted successfully!');
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Product Management
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('vendor', 'username shopName');
        res.render('admin/manage-products', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Product deleted successfully!');
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Order Management
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'username email')
            .populate('products.product', 'name price')
            .sort({ createdAt: -1 });
        res.render('admin/orders', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            req.flash('error_msg', 'Invalid order status');
            return res.redirect('/admin/orders');
        }

        await Order.findByIdAndUpdate(req.params.id, { status });
        req.flash('success_msg', `Order status updated to ${status}`);
        res.redirect('/admin/orders');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Analytics Dashboard
exports.getAnalytics = async (req, res) => {
    try {
        // Total sales (excluding cancelled)
        const salesData = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        // Orders by status
        const statusCounts = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Monthly revenue (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Top selling products
        const topProducts = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.product',
                    totalQuantity: { $sum: '$products.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
        ]);

        // Total users by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Average order value
        const avgOrderValue = salesData.length > 0 && salesData[0].count > 0
            ? salesData[0].total / salesData[0].count
            : 0;

        // Total products
        const totalProducts = await Product.countDocuments();

        res.render('admin/analytics', {
            totalRevenue: salesData.length > 0 ? salesData[0].total : 0,
            totalOrders: salesData.length > 0 ? salesData[0].count : 0,
            avgOrderValue,
            totalProducts,
            statusCounts,
            monthlyRevenue,
            topProducts,
            usersByRole
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
