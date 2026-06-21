
const User = require('../models/User');
const passport = require('passport');

const ALLOWED_ROLES = ['customer', 'vendor'];

exports.getRegister = (req, res) => {
    res.render('auth/register');
};

exports.postRegister = async (req, res) => {
    const { username, email, password, role, shopName } = req.body;
    try {
        // Validate inputs
        const errors = [];
        if (!username || username.trim().length < 3) {
            errors.push('Username must be at least 3 characters');
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please enter a valid email address');
        }
        if (!password || password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        const userRole = ALLOWED_ROLES.includes(role) ? role : 'customer';
        if (role && !ALLOWED_ROLES.includes(role)) {
            errors.push('Invalid role selected');
        }
        if (userRole === 'vendor' && (!shopName || shopName.trim().length < 2)) {
            errors.push('Shop name is required for vendors');
        }

        if (errors.length > 0) {
            return res.render('auth/register', { error: errors.join('. ') });
        }

        const newUser = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: userRole,
            shopName: shopName ? shopName.trim() : ''
        });
        await newUser.save();
        req.flash('success_msg', 'Registration successful! Please login.');
        res.redirect('/auth/login');
    } catch (error) {
        if (error.code === 11000) {
            const field = error.keyPattern.username ? 'Username' : 'Email';
            return res.render('auth/register', { error: `${field} already exists` });
        }
        res.render('auth/register', { error: 'Failed to register user. Please try again.' });
    }
};

exports.getLogin = (req, res) => {
    res.render('auth/login');
};

exports.postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/auth/login');
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            // Save session after login
            req.session.save((err) => {
                if (err) { return next(err); }
                res.redirect('/');
            });
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success_msg', 'Logged out successfully');
        res.redirect('/');
    });
};


