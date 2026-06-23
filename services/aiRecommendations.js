const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

/**
 * AI Recommendation Engine
 * Implements multiple recommendation strategies:
 * 1. Category-Based Similar Products
 * 2. "Customers Also Bought" (Market Basket Analysis)
 * 3. Trending/Popular Products
 * 4. Price-Similarity Based
 */

// Get similar products based on category, price range, and ratings
exports.getSimilarProducts = async (productId, limit = 4) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return [];

        // Find products in same category with similar price range (±30%)
        const priceRange = {
            min: product.price * 0.7,
            max: product.price * 1.3
        };

        const similarProducts = await Product.find({
            _id: { $ne: product._id },
            category: product.category,
            price: { $gte: priceRange.min, $lte: priceRange.max }
        }).limit(limit);

        // If not enough similar products, fill with same category products
        if (similarProducts.length < limit) {
            const additionalProducts = await Product.find({
                _id: { $ne: product._id, $nin: similarProducts.map(p => p._id) },
                category: product.category
            }).limit(limit - similarProducts.length);
            return [...similarProducts, ...additionalProducts];
        }

        return similarProducts;
    } catch (error) {
        console.error('Recommendation error:', error.message);
        return [];
    }
};

// "Customers Also Bought" - Market Basket Analysis
exports.getCustomersAlsoBought = async (productId, limit = 4) => {
    try {
        // Find all orders containing this product
        const orders = await Order.find({
            'products.product': productId
        }).populate('products.product');

        // Count co-occurring products
        const productCounts = {};
        orders.forEach(order => {
            order.products.forEach(item => {
                if (item.product && item.product._id && item.product._id.toString() !== productId) {
                    const id = item.product._id.toString();
                    productCounts[id] = (productCounts[id] || 0) + 1;
                }
            });
        });

        // Sort by frequency and get top products
        const sortedIds = Object.entries(productCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([id]) => id);

        if (sortedIds.length === 0) return [];

        const recommendedProducts = await Product.find({ _id: { $in: sortedIds } });
        // Maintain order
        return sortedIds.map(id => recommendedProducts.find(p => p._id.toString() === id)).filter(Boolean);
    } catch (error) {
        console.error('Also-bought error:', error.message);
        return [];
    }
};

// Get trending/popular products based on order frequency
exports.getTrendingProducts = async (limit = 8) => {
    try {
        // Aggregate order counts per product
        const trending = await Order.aggregate([
            { $unwind: '$products' },
            { $group: { _id: '$products.product', orderCount: { $sum: '$products.quantity' } } },
            { $sort: { orderCount: -1 } },
            { $limit: limit + 10 } // fetch extra to filter out-of-stock
        ]);

        if (trending.length === 0) {
            return Product.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 }).limit(limit);
        }

        const productIds = trending.map(t => t._id);
        const products = await Product.find({ _id: { $in: productIds }, stock: { $gt: 0 } });

        // Maintain trending order
        return trending.map(t => products.find(p => p._id.toString() === t._id.toString())).filter(Boolean);
    } catch (error) {
        console.error('Trending error:', error.message);
        return Product.find().sort({ createdAt: -1 }).limit(limit);
    }
};


