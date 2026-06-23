# 🛒 Multi-Vendor Marketplace

A full-stack multi-vendor marketplace web application built with Node.js, Express, MongoDB, and EJS. Vendors can list products, customers can browse and purchase, and admins can manage the entire platform.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Test Accounts](#test-accounts)
- [API Routes](#api-routes)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

---

## ✨ Features

### 👤 Customer Features
- Browse and search products with **category and price range filters**
- View product details with ratings and reviews
- Add to cart, wishlist, and apply coupons
- Secure checkout with **Razorpay** payment integration
- View order history and **download invoices**
- Write, edit, and delete product reviews
- Email order confirmations
- **AI shopping assistant** — chatbot for product search, prices, stock, orders, and trending picks (OpenRouter/OpenAI-powered, with a rule-based fallback when no API key is set)

### 🏪 Vendor Features
- Dashboard with product overview
- **Upload product images** (drag-and-drop or URL)
- Full CRUD operations for products
- View orders containing their products
- Stock management with automatic deduction

### 👨‍💼 Admin Features
- Dashboard with key statistics
- Manage users (view, delete)
- Manage all products and orders
- Update order status workflow (Paid → Processing → Shipped → Delivered/Cancelled)
- **Analytics dashboard** with revenue, orders by status, monthly trends, and top products

### 🔒 Security Features
- Role-based access control (Customer, Vendor, Admin)
- Password hashing with bcryptjs
- Session management with secure cookies
- NoSQL injection prevention
- Input validation and sanitization
- CSRF-safe session configuration

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Templating** | EJS (Embedded JavaScript) |
| **Authentication** | Passport.js (Local Strategy) |
| **Payments** | Razorpay Integration |
| **Email** | Nodemailer (Ethereal/SMTP) |
| **File Upload** | Multer |
| **Session** | express-session with connect-flash |

---

## 📦 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**
- **Razorpay Account** (for payment testing - optional)

---

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd Source_Code
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your configuration (see [Environment Variables](#environment-variables)).

### 4. Seed the database
```bash
# Create sample users, coupons, and ~200 products fetched from the DummyJSON API
# (falls back to 5 built-in sample products if the API is unreachable)
node seed.js
```

### 5. Start the application
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

### 6. Open in browser
```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file in the `Source_Code` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/multivendor-marketplace

# Session
SESSION_SECRET=your-super-secret-key-here

# Server
PORT=3000

# Razorpay (optional - for payment testing)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Email (optional - uses Ethereal test account if not set)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=Marketplace <no-reply@marketplace.com>

# AI Chatbot (optional - falls back to rule-based replies if unset)
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxx
AI_MODEL=openrouter/free
# Or use OpenAI directly instead of OpenRouter:
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

---

## 👥 Test Accounts

After running `node seed.js`:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@test.com | admin123 |
| **Vendor** | vendor@test.com | password123 |
| **Customer** | customer@test.com | password123 |

---

## 🛣 API Routes

### Public Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Homepage - all products |
| GET | `/search` | Search with filters |
| GET | `/product/:id` | Product details |
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |

### Customer Routes (require login)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/cart/add` | Add item to cart |
| POST | `/cart/remove` | Remove item from cart |
| GET | `/cart` | View cart |
| GET | `/checkout` | Checkout page |
| POST | `/order` | Place order |
| GET | `/orders` | Order history |
| GET | `/invoice/:id` | View invoice |
| POST | `/wishlist/:id` | Toggle wishlist |
| GET | `/wishlist` | View wishlist |
| POST | `/apply-coupon` | Apply coupon code |
| POST | `/review/:productId` | Submit review |
| POST | `/review/helpful/:id` | Mark review helpful |
| POST | `/ai/chatbot` | AI shopping assistant chat |
| GET | `/ai/recommendations/trending` | Trending products (JSON) |
| GET | `/ai/search/suggestions` | Search autocomplete suggestions (JSON) |

### Vendor Routes (require vendor role)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/vendor/dashboard` | Vendor dashboard |
| GET | `/vendor/products/add` | Add product form |
| POST | `/vendor/products/add` | Create product |
| GET | `/vendor/products/edit/:id` | Edit product form |
| POST | `/vendor/products/edit/:id` | Update product |
| POST | `/vendor/products/delete/:id` | Delete product |
| GET | `/vendor/orders` | View vendor orders |

### Admin Routes (require admin role)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/dashboard` | Admin dashboard |
| GET | `/admin/users` | Manage users |
| POST | `/admin/users/delete/:id` | Delete user |
| GET | `/admin/products` | Manage products |
| POST | `/admin/products/delete/:id` | Delete product |
| GET | `/admin/orders` | Manage orders |
| POST | `/admin/orders/status/:id` | Update order status |
| GET | `/admin/analytics` | Analytics dashboard |

---

## 📁 Project Structure

```
Source_Code/
├── app.js                    # Express app configuration
├── package.json              # Dependencies and scripts
├── seed.js                   # Database seeder (users, products via DummyJSON, coupons)
├── generate-ppt.js           # Generates the project presentation (.pptx)
├── .env.example              # Environment variables template
├── config/
│   ├── database.js           # MongoDB connection
│   └── passport.js           # Passport configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── adminController.js    # Admin operations
│   ├── customerController.js # Customer operations
│   └── vendorController.js   # Vendor operations
├── middleware/
│   └── authMiddleware.js     # Auth & role middleware
├── models/
│   ├── User.js               # User model
│   ├── Product.js            # Product model
│   ├── Order.js              # Order model
│   ├── Review.js             # Review model
│   └── Coupon.js             # Coupon model
├── routes/
│   ├── auth.js               # Auth routes
│   ├── admin.js              # Admin routes
│   ├── customer.js           # Customer routes
│   ├── vendor.js             # Vendor routes
│   └── ai.js                 # AI chatbot & recommendation routes
├── services/
│   ├── aiChatbot.js          # Chatbot (OpenRouter/OpenAI + rule-based fallback)
│   ├── aiRecommendations.js  # Trending product logic
│   └── aiSearch.js           # Synonym-aware product search
├── views/
│   ├── partials/             # Reusable components
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── navigation.ejs
│   ├── auth/                 # Auth pages
│   ├── customer/             # Customer pages
│   ├── vendor/               # Vendor pages
│   └── admin/                # Admin pages
├── public/
│   ├── css/style.css         # Custom styles
│   └── js/script.js          # Client-side JS
└── uploads/
    └── products/             # Uploaded product images
```

---

## 💳 Razorpay Test Mode

To test payments:

1. Create a free account at [razorpay.com](https://razorpay.com)
2. Get your test API keys from the dashboard
3. Add them to your `.env` file
4. Use test card: `4111 1111 1111 1111`
5. Use any future expiry date and any CVV

---

## 📧 Email Notifications

The app sends emails using Nodemailer:
- **Order confirmation** to customers
- **New order notification** to vendors

Without SMTP configuration, it uses Ethereal test accounts (check server logs for preview URLs).

---

## 🚀 Deploy to Render (Free)

### Prerequisites
1. Create a free [Render](https://render.com) account
2. Create a free [MongoDB Atlas](https://mongodb.com/atlas) account (free M0 cluster)
3. Push your code to GitHub

### Step-by-Step Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Create Render Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Configure:
     - **Name:** `multi-vendor-marketplace`
     - **Runtime:** Node
     - **Build Command:** `cd Source_Code && npm install`
     - **Start Command:** `cd Source_Code && node app.js`
     - **Plan:** Free

3. **Add Environment Variables**
   In Render's Environment tab, add:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/marketplace
   SESSION_SECRET=<generate-a-random-string>
   PORT=10000
   RAZORPAY_KEY_ID=<your-key>
   RAZORPAY_KEY_SECRET=<your-key>
   OPENROUTER_API_KEY=<your-key>
   AI_MODEL=openrouter/free
   ```

4. **Seed the database** (after first deploy)
   - Go to Render Shell tab
   - Run: `cd Source_Code && node seed.js`

5. **Deploy!**
   - Click **Create Web Service**
   - Render will build and deploy automatically
   - Your app will be live at `https://your-app-name.onrender.com`

> **Note:** Render's free tier spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Passport.js](http://www.passportjs.org/)
- [Razorpay](https://razorpay.com/)
- [Bootstrap](https://getbootstrap.com/)
