const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();

// ========== THEME ==========
const COLORS = {
    primary: '1B2A4A',      // Dark navy
    secondary: '3B82F6',    // Blue accent
    accent: '10B981',       // Green accent
    light: 'F1F5F9',        // Light gray bg
    white: 'FFFFFF',
    text: '1E293B',         // Dark text
    muted: '64748B',        // Muted text
    darkBg: '0F172A',       // Very dark bg
    cardBg: 'FFFFFF',
    border: 'E2E8F0',
};

pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches
pptx.author = 'Multi-Vendor Marketplace Team';
pptx.title = 'Multi-Vendor Marketplace - Project Presentation';
pptx.subject = 'College Mini Project';

// ========== HELPER FUNCTIONS ==========
function addSlideNumber(slide, num, total) {
    slide.addText(`${num} / ${total}`, {
        x: 6.0, y: 7.0, w: 1.33, h: 0.4,
        fontSize: 9, color: COLORS.muted, align: 'center',
    });
}

function addBgRect(slide, color = COLORS.primary) {
    slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0, y: 0, w: 13.33, h: 7.5,
        fill: { color },
    });
}

function addAccentBar(slide) {
    slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0, y: 0, w: 13.33, h: 0.08,
        fill: { color: COLORS.secondary },
    });
}

function addCard(slide, x, y, w, h, opts = {}) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w, h,
        fill: { color: opts.fill || COLORS.white },
        shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.1 },
        rectRadius: 0.1,
        line: { color: opts.border || COLORS.border, width: 0.5 },
    });
}

const TOTAL_SLIDES = 12;

// ============================================================
// SLIDE 1: TITLE
// ============================================================
let slide1 = pptx.addSlide();
addBgRect(slide1, COLORS.darkBg);

// Decorative shapes
slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.4, h: 7.5,
    fill: { color: COLORS.secondary },
});
slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0.4, y: 0, w: 0.08, h: 7.5,
    fill: { color: COLORS.accent },
});

// Title
slide1.addText('🛒', {
    x: 1.5, y: 1.2, w: 2, h: 1.5,
    fontSize: 60, align: 'center', valign: 'middle',
});
slide1.addText('Multi-Vendor\nMarketplace', {
    x: 3.5, y: 1.2, w: 8, h: 1.8,
    fontSize: 44, fontFace: 'Arial', bold: true,
    color: COLORS.white, align: 'left',
    lineSpacingMultiple: 1.1,
});

// Subtitle line
slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 3.5, y: 3.2, w: 3, h: 0.05,
    fill: { color: COLORS.secondary },
});

slide1.addText('A Full-Stack Web Application for Multi-Vendor E-Commerce', {
    x: 3.5, y: 3.5, w: 8, h: 0.6,
    fontSize: 18, fontFace: 'Arial', color: COLORS.muted,
    align: 'left',
});

// Tech stack badges
const techStack = ['Node.js', 'Express', 'MongoDB', 'EJS', 'Bootstrap'];
techStack.forEach((tech, i) => {
    slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 3.5 + (i * 1.8), y: 4.4, w: 1.6, h: 0.45,
        fill: { color: i === 2 ? COLORS.accent : COLORS.secondary },
        rectRadius: 0.05,
    });
    slide1.addText(tech, {
        x: 3.5 + (i * 1.8), y: 4.4, w: 1.6, h: 0.45,
        fontSize: 11, fontFace: 'Arial', bold: true,
        color: COLORS.white, align: 'center', valign: 'middle',
    });
});

slide1.addText('College Mini Project | 2026', {
    x: 3.5, y: 5.8, w: 6, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: COLORS.muted,
});

addSlideNumber(slide1, 1, TOTAL_SLIDES);

// ============================================================
// SLIDE 2: TABLE OF CONTENTS
// ============================================================
let slide2 = pptx.addSlide();
addBgRect(slide2, COLORS.light);
addAccentBar(slide2);

slide2.addText('Table of Contents', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

const tocItems = [
    { num: '01', title: 'Project Overview', desc: 'Introduction and objectives' },
    { num: '02', title: 'Technology Stack', desc: 'Tools and technologies used' },
    { num: '03', title: 'System Architecture', desc: 'MVC architecture diagram' },
    { num: '04', title: 'Database Design', desc: 'MongoDB schemas and models' },
    { num: '05', title: 'Customer Features', desc: 'Shopping, cart, checkout' },
    { num: '06', title: 'Vendor Features', desc: 'Product management dashboard' },
    { num: '07', title: 'Admin Features', desc: 'Platform management and analytics' },
    { num: '08', title: 'Security Features', desc: 'Auth, roles, and protection' },
    { num: '09', title: 'Project Structure', desc: 'Code organization' },
    { num: '10', title: 'Live Demo', desc: 'Screenshots and walkthrough' },
    { num: '11', title: 'Conclusion & Future', desc: 'Summary and next steps' },
];

tocItems.forEach((item, i) => {
    const col = i < 6 ? 0 : 1;
    const row = i < 6 ? i : i - 6;
    const x = 0.8 + (col * 6.2);
    const y = 1.6 + (row * 0.9);

    slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w: 5.8, h: 0.75,
        fill: { color: COLORS.white },
        shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.05 },
        rectRadius: 0.05,
        line: { color: COLORS.border, width: 0.5 },
    });

    slide2.addText(item.num, {
        x: x + 0.15, y, w: 0.6, h: 0.75,
        fontSize: 16, fontFace: 'Arial', bold: true,
        color: COLORS.secondary, valign: 'middle',
    });

    slide2.addText(item.title, {
        x: x + 0.7, y, w: 3, h: 0.4,
        fontSize: 13, fontFace: 'Arial', bold: true,
        color: COLORS.text, valign: 'bottom',
    });

    slide2.addText(item.desc, {
        x: x + 0.7, y: y + 0.35, w: 4.5, h: 0.35,
        fontSize: 10, fontFace: 'Arial',
        color: COLORS.muted, valign: 'top',
    });
});

addSlideNumber(slide2, 2, TOTAL_SLIDES);

// ============================================================
// SLIDE 3: PROJECT OVERVIEW
// ============================================================
let slide3 = pptx.addSlide();
addBgRect(slide3, COLORS.white);
addAccentBar(slide3);

slide3.addText('Project Overview', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

slide3.addText('A full-stack multi-vendor marketplace web application that allows multiple vendors to register, list products, and sell to customers — all managed through a centralized admin dashboard.', {
    x: 0.8, y: 1.3, w: 11.5, h: 0.8,
    fontSize: 14, fontFace: 'Arial', color: COLORS.text,
    lineSpacingMultiple: 1.3,
});

// Objective Card
addCard(slide3, 0.8, 2.4, 5.5, 4.2);
slide3.addText('🎯  Objectives', {
    x: 1.1, y: 2.6, w: 5, h: 0.5,
    fontSize: 18, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

const objectives = [
    'Build a scalable e-commerce platform with multi-vendor support',
    'Implement role-based access (Admin, Vendor, Customer)',
    'Enable real-time product management and order processing',
    'Integrate secure payment gateway (Razorpay)',
    'Provide analytics dashboard for administrators',
    'Create responsive, modern UI with Bootstrap 5',
];

objectives.forEach((obj, i) => {
    slide3.addText(`✓  ${obj}`, {
        x: 1.3, y: 3.2 + (i * 0.52), w: 4.8, h: 0.45,
        fontSize: 11, fontFace: 'Arial', color: COLORS.text,
        valign: 'middle',
    });
});

// Key Highlights Card
addCard(slide3, 6.8, 2.4, 5.5, 4.2);
slide3.addText('✨  Key Highlights', {
    x: 7.1, y: 2.6, w: 5, h: 0.5,
    fontSize: 18, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

const highlights = [
    { label: '194', desc: 'Products from DummyJSON API' },
    { label: '24', desc: 'Product categories' },
    { label: '3', desc: 'User roles with RBAC' },
    { label: 'MVC', desc: 'Clean architecture pattern' },
    { label: '100%', desc: 'Responsive design' },
    { label: 'Secure', desc: 'bcrypt + session auth' },
];

highlights.forEach((h, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 7.1 + (col * 2.6);
    const y = 3.3 + (row * 1.05);

    slide3.addText(h.label, {
        x, y, w: 2.3, h: 0.5,
        fontSize: 22, fontFace: 'Arial', bold: true,
        color: COLORS.secondary, align: 'center',
    });
    slide3.addText(h.desc, {
        x, y: y + 0.45, w: 2.3, h: 0.4,
        fontSize: 10, fontFace: 'Arial',
        color: COLORS.muted, align: 'center',
    });
});

addSlideNumber(slide3, 3, TOTAL_SLIDES);

// ============================================================
// SLIDE 4: TECHNOLOGY STACK
// ============================================================
let slide4 = pptx.addSlide();
addBgRect(slide4, COLORS.white);
addAccentBar(slide4);

slide4.addText('Technology Stack', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

const techCategories = [
    {
        title: 'Backend',
        color: COLORS.secondary,
        items: [
            { name: 'Node.js', desc: 'Runtime environment' },
            { name: 'Express.js', desc: 'Web framework' },
            { name: 'Passport.js', desc: 'Authentication' },
        ],
    },
    {
        title: 'Database',
        color: COLORS.accent,
        items: [
            { name: 'MongoDB', desc: 'NoSQL database' },
            { name: 'Mongoose', desc: 'ODM for MongoDB' },
        ],
    },
    {
        title: 'Frontend',
        color: 'F59E0B',
        items: [
            { name: 'EJS', desc: 'Templating engine' },
            { name: 'Bootstrap 5', desc: 'UI framework' },
            { name: 'HTML5/CSS3', desc: 'Markup & styling' },
        ],
    },
    {
        title: 'Services',
        color: '8B5CF6',
        items: [
            { name: 'Razorpay', desc: 'Payment gateway' },
            { name: 'Nodemailer', desc: 'Email service' },
            { name: 'Multer', desc: 'File uploads' },
        ],
    },
];

techCategories.forEach((cat, ci) => {
    const x = 0.8 + (ci * 3.1);

    // Category header
    slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 1.5, w: 2.8, h: 0.55,
        fill: { color: cat.color },
        rectRadius: 0.05,
    });
    slide4.addText(cat.title, {
        x, y: 1.5, w: 2.8, h: 0.55,
        fontSize: 15, fontFace: 'Arial', bold: true,
        color: COLORS.white, align: 'center', valign: 'middle',
    });

    // Items
    cat.items.forEach((item, ii) => {
        addCard(slide4, x, 2.3 + (ii * 1.35), 2.8, 1.15);
        slide4.addText(item.name, {
            x: x + 0.2, y: 2.4 + (ii * 1.35), w: 2.4, h: 0.5,
            fontSize: 14, fontFace: 'Arial', bold: true, color: COLORS.text,
            valign: 'bottom',
        });
        slide4.addText(item.desc, {
            x: x + 0.2, y: 2.9 + (ii * 1.35), w: 2.4, h: 0.4,
            fontSize: 10, fontFace: 'Arial', color: COLORS.muted,
            valign: 'top',
        });
    });
});

addSlideNumber(slide4, 4, TOTAL_SLIDES);

// ============================================================
// SLIDE 5: SYSTEM ARCHITECTURE
// ============================================================
let slide5 = pptx.addSlide();
addBgRect(slide5, COLORS.light);
addAccentBar(slide5);

slide5.addText('System Architecture', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

slide5.addText('MVC (Model-View-Controller) Pattern', {
    x: 0.8, y: 1.2, w: 8, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: COLORS.muted,
});

// Architecture diagram - horizontal flow
const archLayers = [
    { label: 'Client\n(Browser)', color: COLORS.secondary, x: 0.8 },
    { label: 'Express.js\nRouter', color: '8B5CF6', x: 3.5 },
    { label: 'Controller\n(Business Logic)', color: COLORS.accent, x: 6.2 },
    { label: 'Model\n(Mongoose)', color: 'F59E0B', x: 8.9 },
    { label: 'MongoDB\n(Database)', color: 'EF4444', x: 11.2 },
];

archLayers.forEach((layer, i) => {
    slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: layer.x, y: 2.0, w: 2.0, h: 1.2,
        fill: { color: layer.color },
        rectRadius: 0.08,
        shadow: { type: 'outer', blur: 4, offset: 2, color: '000000', opacity: 0.1 },
    });
    slide5.addText(layer.label, {
        x: layer.x, y: 2.0, w: 2.0, h: 1.2,
        fontSize: 12, fontFace: 'Arial', bold: true,
        color: COLORS.white, align: 'center', valign: 'middle',
    });

    // Arrow between layers
    if (i < archLayers.length - 1) {
        slide5.addText('→', {
            x: layer.x + 2.0, y: 2.2, w: 0.5, h: 0.8,
            fontSize: 24, color: COLORS.muted, align: 'center', valign: 'middle',
        });
    }
});

// MVC breakdown
const mvcItems = [
    {
        title: '📁 Models',
        color: 'F59E0B',
        desc: 'User, Product, Order,\nReview, Coupon',
        y: 3.8,
    },
    {
        title: '👁️ Views',
        color: COLORS.secondary,
        desc: 'EJS Templates with\nBootstrap 5 UI',
        y: 3.8,
    },
    {
        title: '⚙️ Controllers',
        color: COLORS.accent,
        desc: 'authController,\ncustomerController,\nvendorController,\nadminController',
        y: 3.8,
    },
];

mvcItems.forEach((item, i) => {
    const x = 1.2 + (i * 3.9);
    addCard(slide5, x, item.y, 3.4, 2.8);
    slide5.addShape(pptx.shapes.RECTANGLE, {
        x, y: item.y, w: 3.4, h: 0.08,
        fill: { color: item.color },
    });
    slide5.addText(item.title, {
        x: x + 0.2, y: item.y + 0.2, w: 3, h: 0.5,
        fontSize: 16, fontFace: 'Arial', bold: true, color: COLORS.text,
    });
    slide5.addText(item.desc, {
        x: x + 0.2, y: item.y + 0.8, w: 3, h: 1.5,
        fontSize: 12, fontFace: 'Arial', color: COLORS.muted,
        lineSpacingMultiple: 1.4,
    });
});

addSlideNumber(slide5, 5, TOTAL_SLIDES);

// ============================================================
// SLIDE 6: DATABASE DESIGN
// ============================================================
let slide6 = pptx.addSlide();
addBgRect(slide6, COLORS.white);
addAccentBar(slide6);

slide6.addText('Database Design', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

slide6.addText('MongoDB Collections with Mongoose ODM', {
    x: 0.8, y: 1.1, w: 8, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: COLORS.muted,
});

const models = [
    {
        name: 'User',
        color: COLORS.secondary,
        fields: ['username: String (unique)', 'email: String (unique)', 'password: String (hashed)', 'role: customer|vendor|admin', 'shopName: String'],
    },
    {
        name: 'Product',
        color: COLORS.accent,
        fields: ['name: String', 'description: String', 'price: Number', 'category: String', 'stock: Number', 'image: String', 'vendor: ObjectId (ref User)'],
    },
    {
        name: 'Order',
        color: 'F59E0B',
        fields: ['customer: ObjectId (ref User)', 'products: [{product, qty}]', 'totalAmount: Number', 'status: Pending→Delivered', 'shippingAddress: Object'],
    },
    {
        name: 'Review',
        color: '8B5CF6',
        fields: ['product: ObjectId (ref Product)', 'customer: ObjectId (ref User)', 'rating: Number (1-5)', 'comment: String', 'helpful: Number'],
    },
    {
        name: 'Coupon',
        color: 'EF4444',
        fields: ['code: String (unique)', 'discount: Number (%)', 'minPurchase: Number', 'expiresAt: Date', 'isActive: Boolean'],
    },
];

models.forEach((model, i) => {
    const x = 0.5 + (i * 2.5);
    addCard(slide6, x, 1.8, 2.3, 5.0);

    slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 1.8, w: 2.3, h: 0.55,
        fill: { color: model.color },
        rectRadius: 0.05,
    });
    slide6.addText(model.name, {
        x, y: 1.8, w: 2.3, h: 0.55,
        fontSize: 14, fontFace: 'Arial', bold: true,
        color: COLORS.white, align: 'center', valign: 'middle',
    });

    model.fields.forEach((field, fi) => {
        slide6.addText(field, {
            x: x + 0.1, y: 2.5 + (fi * 0.7), w: 2.1, h: 0.6,
            fontSize: 8, fontFace: 'Arial', color: COLORS.text,
            valign: 'top', lineSpacingMultiple: 1.1,
        });
    });
});

addSlideNumber(slide6, 6, TOTAL_SLIDES);

// ============================================================
// SLIDE 7: CUSTOMER FEATURES
// ============================================================
let slide7 = pptx.addSlide();
addBgRect(slide7, COLORS.white);
addAccentBar(slide7);

slide7.addText('Customer Features', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

const custFeatures = [
    { icon: '🔍', title: 'Search & Filter', desc: 'Browse products with category and price range filters' },
    { icon: '🛒', title: 'Shopping Cart', desc: 'Add/remove items, update quantities, apply coupons' },
    { icon: '💳', title: 'Secure Checkout', desc: 'Razorpay payment integration with address management' },
    { icon: '📦', title: 'Order Tracking', desc: 'View order history, status updates, and download invoices' },
    { icon: '⭐', title: 'Reviews & Ratings', desc: 'Write, edit, delete reviews and mark helpful reviews' },
    { icon: '❤️', title: 'Wishlist', desc: 'Save favorite products for later purchase' },
    { icon: '📧', title: 'Email Notifications', desc: 'Order confirmations sent via Nodemailer' },
    { icon: '🏷️', title: 'Coupon System', desc: 'Apply discount codes for special offers' },
];

custFeatures.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + (col * 6.2);
    const y = 1.5 + (row * 1.4);

    addCard(slide7, x, y, 5.8, 1.2);
    slide7.addText(f.icon, {
        x: x + 0.15, y, w: 0.8, h: 1.2,
        fontSize: 28, align: 'center', valign: 'middle',
    });
    slide7.addText(f.title, {
        x: x + 0.9, y: y + 0.1, w: 4.5, h: 0.45,
        fontSize: 14, fontFace: 'Arial', bold: true, color: COLORS.text,
    });
    slide7.addText(f.desc, {
        x: x + 0.9, y: y + 0.55, w: 4.5, h: 0.5,
        fontSize: 11, fontFace: 'Arial', color: COLORS.muted,
    });
});

addSlideNumber(slide7, 7, TOTAL_SLIDES);

// ============================================================
// SLIDE 8: VENDOR & ADMIN FEATURES
// ============================================================
let slide8 = pptx.addSlide();
addBgRect(slide8, COLORS.white);
addAccentBar(slide8);

slide8.addText('Vendor & Admin Features', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

// Vendor Features
slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.4, w: 5.8, h: 0.55,
    fill: { color: COLORS.accent },
    rectRadius: 0.05,
});
slide8.addText('🏪  Vendor Features', {
    x: 0.8, y: 1.4, w: 5.8, h: 0.55,
    fontSize: 16, fontFace: 'Arial', bold: true,
    color: COLORS.white, align: 'center', valign: 'middle',
});

const vendorFeatures = [
    'Product Dashboard — overview of all listed products',
    'Add/Edit/Delete Products — full CRUD operations',
    'Image Upload — drag-and-drop or URL-based',
    'Stock Management — automatic deduction on orders',
    'Order Management — view orders containing their products',
];

vendorFeatures.forEach((f, i) => {
    slide8.addText(`▸  ${f}`, {
        x: 1.0, y: 2.2 + (i * 0.5), w: 5.4, h: 0.45,
        fontSize: 11, fontFace: 'Arial', color: COLORS.text,
        valign: 'middle',
    });
});

// Admin Features
slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.0, y: 1.4, w: 5.5, h: 0.55,
    fill: { color: 'EF4444' },
    rectRadius: 0.05,
});
slide8.addText('👨‍💼  Admin Features', {
    x: 7.0, y: 1.4, w: 5.5, h: 0.55,
    fontSize: 16, fontFace: 'Arial', bold: true,
    color: COLORS.white, align: 'center', valign: 'middle',
});

const adminFeatures = [
    'Admin Dashboard — key statistics and overview',
    'User Management — view, delete users',
    'Product Management — manage all products',
    'Order Status Workflow — Paid → Processing → Shipped → Delivered',
    'Analytics Dashboard — revenue, trends, top products',
];

adminFeatures.forEach((f, i) => {
    slide8.addText(`▸  ${f}`, {
        x: 7.2, y: 2.2 + (i * 0.5), w: 5.1, h: 0.45,
        fontSize: 11, fontFace: 'Arial', color: COLORS.text,
        valign: 'middle',
    });
});

// Security section
addCard(slide8, 0.8, 5.0, 11.7, 1.8);
slide8.addText('🔒  Security Features', {
    x: 1.1, y: 5.1, w: 5, h: 0.5,
    fontSize: 16, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

const secFeatures = [
    'Role-based access control (RBAC)',
    'Password hashing with bcryptjs',
    'Session management with secure cookies',
    'NoSQL injection prevention',
    'Input validation & sanitization',
];

secFeatures.forEach((f, i) => {
    slide8.addText(`✓  ${f}`, {
        x: 1.1 + (i * 2.3), y: 5.6, w: 2.2, h: 0.8,
        fontSize: 10, fontFace: 'Arial', color: COLORS.text,
        valign: 'top',
    });
});

addSlideNumber(slide8, 8, TOTAL_SLIDES);

// ============================================================
// SLIDE 9: PROJECT STRUCTURE
// ============================================================
let slide9 = pptx.addSlide();
addBgRect(slide9, COLORS.darkBg);

slide9.addText('Project Structure', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.white,
});

const structure = [
    { folder: 'config/', desc: 'database.js, passport.js', color: COLORS.secondary },
    { folder: 'controllers/', desc: 'auth, admin, customer, vendor', color: COLORS.accent },
    { folder: 'models/', desc: 'User, Product, Order, Review, Coupon', color: 'F59E0B' },
    { folder: 'routes/', desc: 'auth, admin, customer, vendor', color: '8B5CF6' },
    { folder: 'middleware/', desc: 'authMiddleware.js (RBAC)', color: 'EF4444' },
    { folder: 'views/', desc: 'EJS templates (auth, customer, vendor, admin)', color: '06B6D4' },
    { folder: 'public/', desc: 'css/style.css, js/script.js', color: '84CC16' },
];

structure.forEach((s, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = 0.8 + (col * 6.2);
    const y = 1.5 + (row * 1.25);

    slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w: 5.8, h: 1.0,
        fill: { color: '1E293B' },
        rectRadius: 0.05,
        line: { color: s.color, width: 1.5 },
    });

    slide9.addShape(pptx.shapes.RECTANGLE, {
        x, y, w: 0.08, h: 1.0,
        fill: { color: s.color },
    });

    slide9.addText(s.folder, {
        x: x + 0.3, y, w: 3, h: 0.55,
        fontSize: 15, fontFace: 'Courier New', bold: true,
        color: s.color, valign: 'bottom',
    });
    slide9.addText(s.desc, {
        x: x + 0.3, y: y + 0.5, w: 5.2, h: 0.4,
        fontSize: 11, fontFace: 'Arial',
        color: '94A3B8', valign: 'top',
    });
});

// Key files
slide9.addText('Key Files:  app.js  |  seed.js  |  package.json  |  .env', {
    x: 0.8, y: 6.6, w: 11, h: 0.4,
    fontSize: 12, fontFace: 'Courier New', color: '64748B',
});

addSlideNumber(slide9, 9, TOTAL_SLIDES);

// ============================================================
// SLIDE 10: LIVE DEMO / SCREENSHOTS
// ============================================================
let slide10 = pptx.addSlide();
addBgRect(slide10, COLORS.light);
addAccentBar(slide10);

slide10.addText('Live Demo', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

const demoPages = [
    { title: 'Homepage', desc: 'Product grid with 194 products,\ncategory filter, search bar,\ntrending section', color: COLORS.secondary },
    { title: 'Product Details', desc: 'Full product info, reviews,\nadd to cart, similar products,\ncustomers also bought', color: COLORS.accent },
    { title: 'Vendor Dashboard', desc: 'Product management,\nadd/edit/delete products,\nimage upload, stock control', color: 'F59E0B' },
    { title: 'Admin Dashboard', desc: 'User management, product\noversight, order status workflow,\nanalytics with charts', color: 'EF4444' },
];

demoPages.forEach((d, i) => {
    const x = 0.8 + (i * 3.1);

    // Mock browser frame
    slide10.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 1.5, w: 2.8, h: 4.5,
        fill: { color: COLORS.white },
        shadow: { type: 'outer', blur: 8, offset: 3, color: '000000', opacity: 0.12 },
        rectRadius: 0.1,
        line: { color: COLORS.border, width: 0.5 },
    });

    // Browser top bar
    slide10.addShape(pptx.shapes.RECTANGLE, {
        x, y: 1.5, w: 2.8, h: 0.4,
        fill: { color: 'F8FAFC' },
    });
    slide10.addShape(pptx.shapes.OVAL, {
        x: x + 0.15, y: 1.6, w: 0.12, h: 0.12,
        fill: { color: 'EF4444' },
    });
    slide10.addShape(pptx.shapes.OVAL, {
        x: x + 0.32, y: 1.6, w: 0.12, h: 0.12,
        fill: { color: 'F59E0B' },
    });
    slide10.addShape(pptx.shapes.OVAL, {
        x: x + 0.49, y: 1.6, w: 0.12, h: 0.12,
        fill: { color: '22C55E' },
    });

    // Placeholder content area
    slide10.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.15, y: 2.1, w: 2.5, h: 2.5,
        fill: { color: COLORS.light },
        rectRadius: 0.05,
    });
    slide10.addText(d.title === 'Homepage' ? '🛍️' : d.title === 'Product Details' ? '📦' : d.title === 'Vendor Dashboard' ? '🏪' : '📊', {
        x: x + 0.15, y: 2.2, w: 2.5, h: 2.0,
        fontSize: 48, align: 'center', valign: 'middle',
    });

    // Title and description
    slide10.addText(d.title, {
        x, y: 4.7, w: 2.8, h: 0.4,
        fontSize: 14, fontFace: 'Arial', bold: true, color: COLORS.text,
        align: 'center',
    });
    slide10.addText(d.desc, {
        x: x + 0.1, y: 5.1, w: 2.6, h: 0.8,
        fontSize: 9, fontFace: 'Arial', color: COLORS.muted,
        align: 'center', lineSpacingMultiple: 1.3,
    });
});

slide10.addText('🚀  Live at: http://localhost:3000', {
    x: 0.8, y: 6.5, w: 11, h: 0.5,
    fontSize: 14, fontFace: 'Arial', bold: true,
    color: COLORS.secondary, align: 'center',
});

addSlideNumber(slide10, 10, TOTAL_SLIDES);

// ============================================================
// SLIDE 11: API ROUTES
// ============================================================
let slide11 = pptx.addSlide();
addBgRect(slide11, COLORS.white);
addAccentBar(slide11);

slide11.addText('API Routes', {
    x: 0.8, y: 0.4, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.primary,
});

const routeGroups = [
    {
        title: 'Public Routes',
        color: COLORS.secondary,
        routes: ['GET / — Homepage', 'GET /search — Search with filters', 'GET /product/:id — Product details', 'POST /auth/login — Login', 'POST /auth/register — Register'],
    },
    {
        title: 'Customer Routes',
        color: COLORS.accent,
        routes: ['POST /cart/add — Add to cart', 'GET /cart — View cart', 'GET /checkout — Checkout', 'POST /order — Place order', 'GET /orders — Order history'],
    },
    {
        title: 'Vendor Routes',
        color: 'F59E0B',
        routes: ['GET /vendor/dashboard — Dashboard', 'POST /vendor/products/add — Add product', 'POST /vendor/products/edit/:id — Edit', 'POST /vendor/products/delete/:id — Delete', 'GET /vendor/orders — View orders'],
    },
    {
        title: 'Admin Routes',
        color: 'EF4444',
        routes: ['GET /admin/dashboard — Dashboard', 'GET /admin/users — Manage users', 'GET /admin/products — Manage products', 'GET /admin/orders — Manage orders', 'GET /admin/analytics — Analytics'],
    },
];

routeGroups.forEach((group, gi) => {
    const x = 0.5 + (gi * 3.15);

    slide11.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 1.4, w: 2.95, h: 0.45,
        fill: { color: group.color },
        rectRadius: 0.05,
    });
    slide11.addText(group.title, {
        x, y: 1.4, w: 2.95, h: 0.45,
        fontSize: 12, fontFace: 'Arial', bold: true,
        color: COLORS.white, align: 'center', valign: 'middle',
    });

    addCard(slide11, x, 2.0, 2.95, 4.5);
    group.routes.forEach((route, ri) => {
        slide11.addText(route, {
            x: x + 0.1, y: 2.15 + (ri * 0.8), w: 2.75, h: 0.7,
            fontSize: 8.5, fontFace: 'Courier New', color: COLORS.text,
            valign: 'top', lineSpacingMultiple: 1.2,
        });
    });
});

addSlideNumber(slide11, 11, TOTAL_SLIDES);

// ============================================================
// SLIDE 12: CONCLUSION & THANK YOU
// ============================================================
let slide12 = pptx.addSlide();
addBgRect(slide12, COLORS.darkBg);

// Decorative shapes
slide12.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: COLORS.secondary },
});

slide12.addText('Conclusion & Future Scope', {
    x: 0.8, y: 0.5, w: 8, h: 0.8,
    fontSize: 32, fontFace: 'Arial', bold: true, color: COLORS.white,
});

// What we built
addCard(slide12, 0.8, 1.6, 5.8, 3.0, { fill: '1E293B', border: '334155' });
slide12.addText('✅  What We Built', {
    x: 1.1, y: 1.7, w: 5.2, h: 0.5,
    fontSize: 16, fontFace: 'Arial', bold: true, color: COLORS.accent,
});

const conclusions = [
    'Fully functional multi-vendor marketplace',
    'Three user roles with RBAC authentication',
    'Product management with image upload',
    'Shopping cart, wishlist, and checkout',
    'Razorpay payment integration',
    'Admin analytics dashboard',
    'Responsive UI with modern design',
];

conclusions.forEach((c, i) => {
    slide12.addText(`▸  ${c}`, {
        x: 1.3, y: 2.3 + (i * 0.3), w: 5, h: 0.3,
        fontSize: 10, fontFace: 'Arial', color: 'CBD5E1',
    });
});

// Future scope
addCard(slide12, 7.0, 1.6, 5.5, 3.0, { fill: '1E293B', border: '334155' });
slide12.addText('🔮  Future Enhancements', {
    x: 7.3, y: 1.7, w: 5, h: 0.5,
    fontSize: 16, fontFace: 'Arial', bold: true, color: 'F59E0B',
});

const future = [
    'Mobile app (React Native / Flutter)',
    'Real-time notifications (WebSockets)',
    'AI-powered product recommendations',
    'Advanced search with Elasticsearch',
    'Multi-currency support',
    'Vendor analytics & reporting',
    'Social login (Google, GitHub)',
];

future.forEach((f, i) => {
    slide12.addText(`▸  ${f}`, {
        x: 7.5, y: 2.3 + (i * 0.3), w: 4.8, h: 0.3,
        fontSize: 10, fontFace: 'Arial', color: 'CBD5E1',
    });
});

// Thank You section
slide12.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 2.5, y: 5.0, w: 8.3, h: 1.8,
    fill: { color: '1E293B' },
    rectRadius: 0.1,
    line: { color: COLORS.secondary, width: 1.5 },
});

slide12.addText('Thank You!', {
    x: 2.5, y: 5.1, w: 8.3, h: 1.0,
    fontSize: 36, fontFace: 'Arial', bold: true,
    color: COLORS.white, align: 'center', valign: 'middle',
});

slide12.addText('Questions & Discussion', {
    x: 2.5, y: 5.9, w: 8.3, h: 0.5,
    fontSize: 16, fontFace: 'Arial',
    color: COLORS.muted, align: 'center',
});

slide12.addText('🛒 Multi-Vendor Marketplace  |  Node.js + Express + MongoDB + EJS  |  2026', {
    x: 2.5, y: 6.3, w: 8.3, h: 0.4,
    fontSize: 10, fontFace: 'Arial',
    color: '475569', align: 'center',
});

addSlideNumber(slide12, 12, TOTAL_SLIDES);

// ========== GENERATE FILE ==========
const outputPath = 'D:/rajampet FRD/MultiVendorMarketplace/Source_Code/MultiVendorMarketplace_Presentation.pptx';

pptx.writeFile({ fileName: outputPath })
    .then(() => {
        console.log(`✅ Presentation generated successfully!`);
        console.log(`📄 File: ${outputPath}`);
        console.log(`📊 Slides: ${TOTAL_SLIDES}`);
    })
    .catch((err) => {
        console.error('❌ Error generating presentation:', err);
    });
