# GRAPHIFY_GRAPH — Multi-Vendor Marketplace

## Architecture Relationship Graph

```mermaid
graph TB
    %% === LAYER STYLING ===
    classDef entry fill:#ff6b6b,stroke:#c92a2a,color:#fff,font-weight:bold
    classDef config fill:#ffd43b,stroke:#f59f00,color:#000
    classDef route fill:#69db7c,stroke:#2f9e44,color:#000
    classDef middleware fill:#74c0fc,stroke:#1c7ed6,color:#000
    classDef controller fill:#da77f2,stroke:#9c36b5,color:#fff
    classDef model fill:#ffa94d,stroke:#e67700,color:#000
    classDef hotspot stroke:#e03131,stroke-width:4px,color:#e03131

    %% === ENTRY ===
    app["🌐 app.js<br/>Entry Point<br/>Express + Session + Passport"]
    class app entry,hotspot

    %% === CONFIG ===
    db["🗄️ config/database.js<br/>Mongoose Connect<br/>⚠️ Deprecated options"]
    passport["🔑 config/passport.js<br/>LocalStrategy<br/>serialize/deserialize"]
    class db config
    class passport config

    %% === MIDDLEWARE ===
    authMW["🛡️ middleware/authMiddleware.js<br/>ensureAuthenticated<br/>isAdmin · isVendor"]
    class authMW middleware

    %% === ROUTES ===
    rAuth["🔗 routes/auth.js<br/>GET/POST register<br/>GET/POST login · logout"]
    rAdmin["🔗 routes/admin.js<br/>/dashboard · /users<br/>/products"]
    rVendor["🔗 routes/vendor.js<br/>/dashboard<br/>/products/add · edit · delete"]
    rCustomer["🔗 routes/customer.js<br/>/ · /search · /cart<br/>/checkout · /orders · /reviews"]
    class rAuth route
    class rAdmin route
    class rVendor route
    class rCustomer route,hotspot

    %% === CONTROLLERS ===
    cAuth["👤 controllers/authController.js<br/>getRegister · postRegister<br/>getLogin · postLogin · logout"]
    cAdmin["👔 controllers/adminController.js<br/>getDashboard · getUsers<br/>getProducts · delete*"]
    cVendor["🏪 controllers/vendorController.js<br/>getDashboard ⚠️ DUPLICATE<br/>add · edit · delete product"]
    cCustomer["🛒 controllers/customerController.js<br/>20+ exports — GOD OBJECT<br/>Products · Cart · Orders · Reviews<br/>Wishlist · Coupons · Razorpay"]
    class cAuth controller
    class cAdmin controller,hotspot
    class cVendor controller,hotspot
    class cCustomer controller,hotspot

    %% === MODELS ===
    mUser["👤 models/User.js<br/>username · email · password<br/>role · shopName · wishlist"]
    mProduct["📦 models/Product.js<br/>name · price · category<br/>stock · image · vendor"]
    mOrder["📋 models/Order.js<br/>customer · products[] · totalAmount<br/>status · shippingAddress"]
    mReview["⭐ models/Review.js<br/>product · user · rating<br/>comment · helpfulUsers"]
    mCoupon["🎫 models/Coupon.js<br/>code · discount<br/>expiryDate · isActive"]
    class mUser model
    class mProduct model
    class mOrder model
    class mReview model
    class mCoupon model

    %% === ROUTE MOUNTS (app.js → routes) ===
    app -->|"/auth"| rAuth
    app -->|"/admin"| rAdmin
    app -->|"/vendor"| rVendor
    app -->|"/"| rCustomer

    %% === CONFIG IMPORTS ===
    app -->|"require"| db
    app -->|"require"| passport
    passport -->|"User.findOne"| mUser

    %% === ROUTE → CONTROLLER ===
    rAuth --> cAuth
    rAdmin --> cAdmin
    rAdmin -->|"guard"| authMW
    rVendor --> cVendor
    rVendor -->|"guard"| authMW
    rCustomer --> cCustomer
    rCustomer -->|"guard"| authMW

    %% === CONTROLLER → MODEL ===
    cAuth -->|"findOne · save"| mUser
    cAdmin -->|"find · delete"| mUser
    cAdmin -->|"find · delete"| mProduct
    cVendor -->|"find · save · delete"| mProduct
    cCustomer -->|"find · findById"| mProduct
    cCustomer -->|"find · save"| mOrder
    cCustomer -->|"find · create · update"| mReview
    cCustomer -->|"findById · save"| mUser
    cCustomer -->|"findOne"| mCoupon

    %% === HOTSPOT ANNOTATIONS ===
    linkStyle 12 stroke:#e03131,stroke-width:3px
    linkStyle 13 stroke:#e03131,stroke-width:3px
```

## Hotspot Detail Views

### 🔴 Hotspot #1: customerController.js (16 hits)

```mermaid
graph LR
    subgraph "customerController.js — Split into:"
        subgraph "→ productController"
            CP1["getProducts"]
            CP2["getProductDetails"]
            CP3["searchProducts"]
        end
        subgraph "→ cartController"
            CC1["getCart"]
            CC2["postAddToCart"]
            CC3["postRemoveFromCart"]
        end
        subgraph "→ orderController"
            CO1["getCheckout"]
            CO2["postOrder"]
            CO3["getOrderHistory"]
        end
        subgraph "→ reviewController"
            CR1["postReview"]
            CR2["getEditReview"]
            CR3["postEditReview"]
            CR4["deleteReview"]
            CR5["markHelpful"]
        end
        subgraph "→ couponController"
            CU1["applyCoupon"]
        end
        subgraph "→ wishlistController"
            CW1["toggleWishlist"]
            CW2["getWishlist"]
        end
        subgraph "→ paymentController"
            CP4["createRazorpayOrder"]
        end
    end

    classDef suggested fill:#d3f9d8,stroke:#2f9e44,color:#000
    class CP1,CP2,CP3,CC1,CC2,CC3,CO1,CO2,CO3,CR1,CR2,CR3,CR4,CR5,CU1,CW1,CW2,CP4 suggested
```

### 🔴 Hotspot #2: vendorController.js (5 hits)

```mermaid
graph LR
    subgraph "vendorController.js — Issues"
        V1["getDashboard<br/>⚠️ DUPLICATE DEF"]
        V2["getAddProduct"]
        V3["postAddProduct"]
        V4["getEditProduct<br/>✅ has ownership check"]
        V5["postEditProduct<br/>❌ NO ownership check"]
        V6["deleteProduct<br/>❌ NO ownership check"]
    end

    classDef bug fill:#ffe3e3,stroke:#e03131,color:#000
    classDef ok fill:#d3f9d8,stroke:#2f9e44,color:#000
    class V1,V5,V6 bug
    class V4 ok
```

### 🔴 Hotspot #3: Auth Gaps (cross-cutting)

```mermaid
graph TB
    subgraph "Authentication & Authorization Gaps"
        A1["SEC-004: POST /auth/register<br/>role=admin exploitable<br/>CRITICAL"]
        A2["SEC-002: POST /apply-coupon<br/>No ensureAuthenticated<br/>CRITICAL"]
        A3["SEC-002: POST /create-razorpay-order<br/>No ensureAuthenticated<br/>CRITICAL"]
        A4["SEC-007: POST /vendor/products/edit/:id<br/>No vendor ownership check<br/>HIGH"]
        A5["SEC-003: All POST routes<br/>No CSRF protection<br/>MEDIUM"]
        A6["SEC-001: GET /search?q=<br/>NoSQL injection via regex<br/>HIGH"]
    end

    classDef critical fill:#e03131,stroke:#c92a2a,color:#fff
    classDef high fill:#f08c00,stroke:#e67700,color:#fff
    classDef medium fill:#ffd43b,stroke:#f59f00,color:#000
    class A1,A2,A3 critical
    class A4,A6 high
    class A5 medium
```

## Issue Distribution by File

```mermaid
pie title Issues by File
    "customerController.js" : 16
    "app.js" : 6
    "vendorController.js" : 5
    "adminController.js" : 3
    "authController.js" : 3
    "routes/customer.js" : 2
    "routes/auth.js" : 1
    "config/database.js" : 1
    "models/Coupon.js" : 1
```
