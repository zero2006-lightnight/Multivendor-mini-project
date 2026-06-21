# AATA CHUSTAVA Report — Multi-Vendor Marketplace

**Date:** 2026-06-21
**Codebase:** Node.js/Express/MongoDB/EJS Multi-Vendor Marketplace
**Files scanned:** 43 total (17 source JS, 12 EJS views, 5 models, 4 routes, 4 controllers)
**Stack:** Express 4.18.2 · Mongoose 7.8.9 · Passport Local · EJS · Razorpay · bcryptjs · connect-flash
**Archetype:** MVC Monolith — Session-based cart · Role-based auth (customer/vendor/admin)

---

## 1-Line Summary

A college-level MVC marketplace with a **critical auth escalation vulnerability** (any user can register as admin), a **god controller** (customerController.js with 20+ exports handling 8+ domains), and **missing auth on payment/coupon routes** — plus 12 other issues across security, quality, and architecture.

---

## Top 5 Actions (Priority Order)

| # | ID | Severity | Title | File | Action |
|---|-----|----------|-------|------|--------|
| 1 | SEC-004 | **CRITICAL** | Admin role escalation on registration | `controllers/authController.js` | Whitelist allowed roles; default to 'customer' |
| 2 | SEC-002 | **CRITICAL** | Missing auth on coupon & payment routes | `routes/customer.js` | Add `ensureAuthenticated` middleware to apply-coupon and create-razorpay-order |
| 3 | SEC-001 | **HIGH** | NoSQL injection via search regex | `controllers/customerController.js:searchProducts()` | Escape regex special chars before passing to `$regex` |
| 4 | SEC-007 | **HIGH** | Vendor can edit any product | `controllers/vendorController.js:postEditProduct()` | Verify `product.vendor === req.user.id` before update |
| 5 | ARCH-001 | **HIGH** | God controller — customerController.js | `controllers/customerController.js` | Split into productController, cartController, orderController, reviewController, couponController |

---

## Root Causes Table

| Root Cause | Symptoms | Files Affected | Fix Strategy |
|------------|----------|----------------|--------------|
| **No input validation anywhere** | NoSQL injection (SEC-001), role escalation (SEC-004), no password strength (SEC-012), no price validation (SEC-011) | authController, customerController, vendorController | Add express-validator or joi middleware on all POST routes |
| **Inconsistent auth middleware** | Coupon/payment routes unprotected (SEC-002), no CSRF (SEC-003) | routes/customer.js, app.js | Apply `ensureAuthenticated` to all state-changing routes; add csurf middleware |
| **God object anti-pattern** | customerController has 20+ exports across 8 domains (ARCH-001) | controllers/customerController.js | Split by domain responsibility |
| **No authorization ownership checks** | Vendor can edit any product (SEC-007), vendor can delete any product | controllers/vendorController.js | Always verify `resource.vendor === req.user.id` |
| **Missing error handling strategy** | Info leaks via error.message (SEC-005), inconsistent catch blocks (QUAL-010), no global error handler (ARCH-007) | All controllers, app.js | Add global error handler; strip error.message in production |

---

## All Findings

### Wave 1A: Architecture + Flow

| ID | Severity | File | Line | Category | Title | Description |
|----|----------|------|------|----------|-------|-------------|
| ARCH-001 | HIGH | controllers/customerController.js | 1-350 | architecture | God controller | 20+ exports handling products, cart, orders, reviews, wishlist, coupons, payments. Single responsibility violated. |
| ARCH-002 | HIGH | controllers/vendorController.js | 13-19, 39-52 | architecture | Duplicate getDashboard | Function defined twice; second definition silently overwrites first. Second adds console.log debugging. |
| ARCH-003 | MEDIUM | controllers/adminController.js | 15 | flow | Missing view file | `getUsers` renders 'admin/manage-users' but that view does not exist in the file tree. Will crash. |
| ARCH-004 | LOW | config/database.js | 5-8 | architecture | Deprecated Mongoose options | `useNewUrlParser` and `useUnifiedTopology` are deprecated in Mongoose 7+. No-op but noisy. |
| ARCH-005 | MEDIUM | app.js | 8 | flow | Unhandled connectDB promise | `connectDB()` returns a promise but is not awaited. Server may start before DB is ready. |
| ARCH-006 | MEDIUM | app.js | 38 | flow | No 404 handler | No catch-all route for undefined paths. Clients get default Express 404. |
| ARCH-007 | MEDIUM | app.js | — | error | No global error handler | No Express error middleware. Unhandled errors crash the process or leak stack traces. |
| ARCH-008 | MEDIUM | controllers/customerController.js | getCart() | architecture | Session stores full Mongoose objects | Cart stores entire product documents. Memory bloat; stale data if product changes. |
| ARCH-009 | LOW | controllers/customerController.js | 6-8 | flow | Razorpay init at module load | If RAZORPAY_KEY_ID/SECRET env vars missing, app crashes at require-time with no helpful error. |
| ARCH-010 | HIGH | routes/customer.js | 52-58 | middleware | Missing auth on critical routes | `apply-coupon` and `create-razorpay-order` have no `ensureAuthenticated`. Anonymous users can apply coupons and create payment orders. |

### Wave 1B: Quality + Performance

| ID | Severity | File | Line | Category | Title | Description |
|----|----------|------|------|----------|-------|-------------|
| QUAL-001 | HIGH | controllers/vendorController.js | 13, 39 | duplication | Duplicate getDashboard | Same function defined twice. Second silently overwrites first. |
| QUAL-002 | HIGH | controllers/authController.js | postRegister | validation | No input validation on registration | No email format check, no password strength, no role whitelist. |
| QUAL-003 | HIGH | controllers/customerController.js | searchProducts() | validation | NoSQL injection via regex | `req.query.search` passed directly to `$regex` without escaping. Regex injection / ReDoS possible. |
| QUAL-004 | MEDIUM | controllers/customerController.js | applyCoupon() | quality | Coupon expiry not validated | Finds coupon by code but never checks `isActive` or `expiryDate`. Expired coupons still work. |
| QUAL-005 | MEDIUM | controllers/customerController.js | getProducts() | performance | No pagination | `Product.find()` with no limit. Fetches ALL products. Degrades as catalog grows. |
| QUAL-006 | LOW | controllers/customerController.js | multiple | formatting | Console.log in production | 15+ console.log statements left in production code paths. |
| QUAL-007 | HIGH | controllers/vendorController.js | postEditProduct() | quality | No ownership check on edit | Any vendor can edit any other vendor's product via product ID. |
| QUAL-008 | MEDIUM | controllers/customerController.js | postAddToCart() | memory | Session cart stores full documents | Full Mongoose product objects stored in session. Causes memory bloat and stale data. |
| QUAL-009 | MEDIUM | controllers/customerController.js | postAddToCart() | quality | No stock validation | Doesn't check if requested quantity is available in stock. |
| QUAL-010 | MEDIUM | multiple controllers | catch blocks | quality | Inconsistent error handling | Some expose error.message to client, others return generic 'Server Error'. No pattern. |
| QUAL-011 | MEDIUM | app.js | — | security | No CSRF protection | No csurf middleware. All POST routes vulnerable to CSRF. |
| QUAL-012 | MEDIUM | controllers/adminController.js | getUsers | quality | Missing view reference | Renders 'admin/manage-users' which doesn't exist. Will throw template error. |
| QUAL-013 | LOW | controllers/customerController.js | throughout | formatting | Inconsistent formatting | Wildly inconsistent indentation, spacing, and line breaks throughout the file. |
| QUAL-014 | MEDIUM | controllers/customerController.js | getWishlist() | error | No try/catch | `getWishlist` has no error handling. DB error will crash the request. |
| QUAL-015 | MEDIUM | controllers/customerController.js | createRazorpayOrder() | security | Amount from session, not server | Razorpay order amount derived from session cart which the client can manipulate. |

### Wave 2C: Bugs + Security

| ID | Severity | File | Line | Category | Title | Description |
|----|----------|------|------|----------|-------|-------------|
| SEC-001 | HIGH | controllers/customerController.js | searchProducts() | injection | NoSQL injection via regex | User-controlled regex passed to MongoDB. Can cause ReDoS or data extraction. |
| SEC-002 | CRITICAL | routes/customer.js | 52-58 | auth | Missing auth on payment/coupon routes | `apply-coupon` and `create-razorpay-order` accessible without login. |
| SEC-003 | MEDIUM | app.js | — | security | No CSRF protection | State-changing POST routes lack CSRF tokens. |
| SEC-004 | CRITICAL | controllers/authController.js | postRegister() | auth | Admin role escalation | `req.body.role` passed directly to User constructor. Any user can register as admin. |
| SEC-005 | MEDIUM | controllers/customerController.js | postOrder() | info-leak | Error message leaked to client | `res.status(500).send(error.message)` exposes internal details. |
| SEC-006 | LOW | routes/auth.js | — | security | No rate limiting | No brute-force protection on login/register endpoints. |
| SEC-007 | HIGH | controllers/vendorController.js | postEditProduct() | auth | Vendor can edit any product | No ownership verification before update. |
| SEC-008 | MEDIUM | app.js | session config | security | Session fixation risk | `saveUninitialized: true` with no session regeneration on login. |
| SEC-009 | MEDIUM | controllers/customerController.js | createRazorpayOrder() | security | Razorpay amount manipulable | Amount from client-controlled session, not validated server-side. |
| SEC-010 | MEDIUM | controllers/adminController.js | getUsers() | bug | Missing view crashes server | Renders nonexistent 'admin/manage-users' template. |
| SEC-011 | MEDIUM | controllers/vendorController.js | postAddProduct() | validation | No input validation on product creation | No price/stock validation. Negative prices or stock possible. |
| SEC-012 | LOW | controllers/authController.js | postRegister() | security | Weak password policy | No minimum length or complexity requirements. |

### Wave 2D: Cross-Cutting Verification

| ID | Severity | Files | Category | Title | Description |
|----|----------|-------|----------|-------|-------------|
| XC-001 | HIGH | controllers/vendorController.js | bug | Duplicate getDashboard CONFIRMED | Both waves flagged. Second definition silently overwrites. Real bug. |
| XC-002 | MEDIUM | controllers/adminController.js | bug | Missing manage-users view CONFIRMED | File tree confirms only dashboard.ejs and manage-products.ejs exist under admin/. |
| XC-003 | HIGH | controllers/customerController.js | architecture | God controller — single point of failure | 12+ findings across all waves point to this one file. Any bug affects entire customer experience. |
| XC-004 | HIGH | routes/customer.js, app.js | auth | Auth gap pattern | Authentication/authorization inconsistently applied across routes. |
| XC-005 | MEDIUM | multiple controllers | error | Error handling inconsistency | No consistent error strategy. Mix of info leaks and generic messages. |
| XC-006 | MEDIUM | app.js, controllers/customerController.js | session | Session security pattern | Full objects in session + no login regeneration = memory bloat + fixation risk. |

---

## GRAPH_MEMORY (JSON)

```json
{
  "files": {
    "app.js": {
      "type": "entry",
      "imports": ["config/database.js", "config/passport.js", "routes/auth.js", "routes/admin.js", "routes/vendor.js", "routes/customer.js"],
      "issues": ["ARCH-005", "ARCH-006", "ARCH-007", "QUAL-011", "SEC-003", "SEC-008"]
    },
    "config/database.js": {
      "type": "config",
      "imports": ["mongoose"],
      "issues": ["ARCH-004"]
    },
    "config/passport.js": {
      "type": "config",
      "imports": ["passport-local", "models/User.js"],
      "issues": []
    },
    "middleware/authMiddleware.js": {
      "type": "middleware",
      "imports": [],
      "issues": []
    },
    "controllers/authController.js": {
      "type": "controller",
      "imports": ["models/User.js", "passport"],
      "issues": ["QUAL-002", "SEC-004", "SEC-012"]
    },
    "controllers/adminController.js": {
      "type": "controller",
      "imports": ["models/User.js", "models/Product.js"],
      "issues": ["ARCH-003", "QUAL-012", "SEC-010"]
    },
    "controllers/customerController.js": {
      "type": "controller",
      "imports": ["models/Product.js", "models/Order.js", "models/Review.js", "models/User.js", "models/Coupon.js", "razorpay"],
      "issues": ["ARCH-001", "ARCH-008", "ARCH-010", "QUAL-003", "QUAL-004", "QUAL-005", "QUAL-006", "QUAL-008", "QUAL-009", "QUAL-010", "QUAL-014", "QUAL-015", "SEC-001", "SEC-002", "SEC-005", "SEC-009"]
    },
    "controllers/vendorController.js": {
      "type": "controller",
      "imports": ["models/Product.js"],
      "issues": ["ARCH-002", "QUAL-001", "QUAL-007", "SEC-007", "SEC-011"]
    },
    "routes/auth.js": {
      "type": "route",
      "imports": ["controllers/authController.js"],
      "issues": ["SEC-006"]
    },
    "routes/admin.js": {
      "type": "route",
      "imports": ["controllers/adminController.js", "middleware/authMiddleware.js"],
      "issues": []
    },
    "routes/customer.js": {
      "type": "route",
      "imports": ["controllers/customerController.js", "middleware/authMiddleware.js"],
      "issues": ["ARCH-010", "SEC-002"]
    },
    "routes/vendor.js": {
      "type": "route",
      "imports": ["controllers/vendorController.js", "middleware/authMiddleware.js"],
      "issues": []
    },
    "models/User.js": {
      "type": "model",
      "imports": ["mongoose", "bcryptjs"],
      "issues": []
    },
    "models/Product.js": {
      "type": "model",
      "imports": ["mongoose"],
      "issues": []
    },
    "models/Order.js": {
      "type": "model",
      "imports": ["mongoose"],
      "issues": []
    },
    "models/Review.js": {
      "type": "model",
      "imports": ["mongoose"],
      "issues": []
    },
    "models/Coupon.js": {
      "type": "model",
      "imports": ["mongoose"],
      "issues": ["QUAL-004"]
    }
  },
  "edges": [
    {"from": "app.js", "to": "config/database.js", "type": "import"},
    {"from": "app.js", "to": "config/passport.js", "type": "import"},
    {"from": "app.js", "to": "routes/auth.js", "type": "route-mount"},
    {"from": "app.js", "to": "routes/admin.js", "type": "route-mount"},
    {"from": "app.js", "to": "routes/vendor.js", "type": "route-mount"},
    {"from": "app.js", "to": "routes/customer.js", "type": "route-mount"},
    {"from": "config/passport.js", "to": "models/User.js", "type": "import"},
    {"from": "routes/auth.js", "to": "controllers/authController.js", "type": "import"},
    {"from": "routes/admin.js", "to": "controllers/adminController.js", "type": "import"},
    {"from": "routes/admin.js", "to": "middleware/authMiddleware.js", "type": "import"},
    {"from": "routes/customer.js", "to": "controllers/customerController.js", "type": "import"},
    {"from": "routes/customer.js", "to": "middleware/authMiddleware.js", "type": "import"},
    {"from": "routes/vendor.js", "to": "controllers/vendorController.js", "type": "import"},
    {"from": "routes/vendor.js", "to": "middleware/authMiddleware.js", "type": "import"},
    {"from": "controllers/authController.js", "to": "models/User.js", "type": "import"},
    {"from": "controllers/adminController.js", "to": "models/User.js", "type": "import"},
    {"from": "controllers/adminController.js", "to": "models/Product.js", "type": "import"},
    {"from": "controllers/customerController.js", "to": "models/Product.js", "type": "import"},
    {"from": "controllers/customerController.js", "to": "models/Order.js", "type": "import"},
    {"from": "controllers/customerController.js", "to": "models/Review.js", "type": "import"},
    {"from": "controllers/customerController.js", "to": "models/User.js", "type": "import"},
    {"from": "controllers/customerController.js", "to": "models/Coupon.js", "type": "import"},
    {"from": "controllers/vendorController.js", "to": "models/Product.js", "type": "import"}
  ],
  "hotspots": {
    "controllers/customerController.js": {
      "hits": 16,
      "focusArea": "ALL — split into domain controllers"
    },
    "controllers/vendorController.js": {
      "hits": 5,
      "focusArea": "ownership checks, dedup getDashboard"
    },
    "controllers/adminController.js": {
      "hits": 3,
      "focusArea": "missing view, error handling"
    },
    "app.js": {
      "hits": 6,
      "focusArea": "auth middleware, error handling, CSRF"
    }
  }
}
```

---

## Finding Counts

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 9 |
| MEDIUM | 15 |
| LOW | 4 |
| **Total** | **30** |
