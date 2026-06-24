
require('dotenv').config();
const express = require('express');
require('express-async-errors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/database');
const flash = require('connect-flash');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

connectDB();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use(flash());
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Global variables for user
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// Health check endpoint (for Render)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Seed endpoint (remove after use)
app.get('/seed', async (req, res) => {
    try {
        const User = require('./models/User');
        const Product = require('./models/Product');

        let vendor = await User.findOne({ email: 'vendor@market.com' });
        if (!vendor) {
            vendor = await User.create({ username: 'vendor1', email: 'vendor@market.com', password: 'vendor123', role: 'vendor', shopName: 'Tech Haven' });
        }

        await Product.deleteMany({});
        const products = [
            { name: 'Wireless Bluetooth Headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.', price: 79.99, category: 'Electronics', stock: 25, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', vendor: vendor._id },
            { name: 'Organic Green Tea Set', description: 'Premium Japanese green tea collection with ceramic teapot.', price: 45.99, category: 'Food & Beverages', stock: 15, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', vendor: vendor._id },
            { name: 'Handmade Leather Journal', description: 'Genuine leather bound journal with 200 pages.', price: 34.99, category: 'Stationery', stock: 30, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', vendor: vendor._id },
            { name: 'Smart Fitness Watch', description: 'Advanced fitness tracker with heart rate monitor and GPS.', price: 129.99, category: 'Electronics', stock: 20, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', vendor: vendor._id },
            { name: 'Artisan Ceramic Mug Set', description: 'Set of 4 handcrafted ceramic mugs.', price: 39.99, category: 'Home & Kitchen', stock: 18, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', vendor: vendor._id },
            { name: 'Bamboo Cutting Board', description: 'Eco-friendly bamboo cutting board with juice groove.', price: 24.99, category: 'Home & Kitchen', stock: 40, image: 'https://images.unsplash.com/photo-1588167862229-32aa9e37a7c6?w=500', vendor: vendor._id },
            { name: 'Plant-Based Protein Powder', description: 'Organic vegan protein powder with 25g protein per serving.', price: 34.99, category: 'Food & Beverages', stock: 50, image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500', vendor: vendor._id },
            { name: 'Portable Phone Charger', description: 'Compact 10000mAh portable charger with fast charging.', price: 29.99, category: 'Electronics', stock: 35, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', vendor: vendor._id },
            { name: 'Yoga Mat Premium', description: 'Extra thick non-slip yoga mat. Eco-friendly materials.', price: 49.99, category: 'Sports & Fitness', stock: 22, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', vendor: vendor._id },
            { name: 'Minimalist Desk Lamp', description: 'Modern LED desk lamp with adjustable brightness.', price: 42.99, category: 'Home & Kitchen', stock: 15, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab788?w=500', vendor: vendor._id },
            { name: 'Organic Cotton T-Shirt', description: 'Soft organic cotton t-shirt. Sustainable fashion.', price: 28.99, category: 'Fashion', stock: 60, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', vendor: vendor._id },
            { name: 'Stainless Steel Water Bottle', description: 'Double-wall insulated water bottle.', price: 19.99, category: 'Sports & Fitness', stock: 45, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', vendor: vendor._id }
        ];
        await Product.insertMany(products);
        res.json({ message: 'Seeded ' + products.length + ' products' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/vendor', require('./routes/vendor'));
app.use('/ai', require('./routes/ai'));
app.use('/', require('./routes/customer'));

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        statusCode: 404,
        message: 'Page Not Found',
        description: 'The page you are looking for does not exist.'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).send(`
        <h1>Server Error</h1>
        <pre>${err.message || 'Unknown error'}</pre>
        <pre>${err.stack || ''}</pre>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`AI Provider: ${process.env.OPENROUTER_API_KEY ? 'OpenRouter' : process.env.OPENAI_API_KEY ? 'OpenAI' : 'Rule-based'}`);
});
