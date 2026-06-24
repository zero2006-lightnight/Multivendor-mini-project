
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
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
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

    res.locals.success_msg =
        req.flash('success_msg');

    res.locals.error_msg =
        req.flash('error_msg');

    next();

});

// Health check endpoint (for Render)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
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


