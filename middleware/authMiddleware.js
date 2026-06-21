
module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to access this page');
        res.redirect('/auth/login');
    },
    isAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next();
        }
        res.status(403).send('Access Denied');
    },
    isVendor: (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === 'vendor') {
            return next();
        }
        res.status(403).send('Access Denied');
    }
};


