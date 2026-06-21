const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const vendorController = require('../controllers/vendorController');
const { ensureAuthenticated, isVendor } = require('../middleware/authMiddleware');

// Multer config for product images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads', 'products'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, png, gif, webp) are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash('error_msg', 'File too large. Maximum size is 5MB.');
            return res.redirect('back');
        }
        req.flash('error_msg', 'File upload error: ' + err.message);
        return res.redirect('back');
    }
    if (err && err.message && err.message.includes('Only image files')) {
        req.flash('error_msg', err.message);
        return res.redirect('back');
    }
    next(err);
};

router.get('/dashboard', ensureAuthenticated, isVendor, vendorController.getDashboard);
router.get('/products/add', ensureAuthenticated, isVendor, vendorController.getAddProduct);
router.post('/products/add', ensureAuthenticated, isVendor, upload.single('productImage'), handleMulterError, vendorController.postAddProduct);
router.get('/products/edit/:id', ensureAuthenticated, isVendor, vendorController.getEditProduct);
router.post('/products/edit/:id', ensureAuthenticated, isVendor, upload.single('productImage'), handleMulterError, vendorController.postEditProduct);
router.post('/products/delete/:id', ensureAuthenticated, isVendor, vendorController.deleteProduct);
router.get('/orders', ensureAuthenticated, isVendor, vendorController.getOrders);

module.exports = router;
