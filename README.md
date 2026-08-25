# 🛒 Forever — Modern Full-Stack MERN E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v5-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v7-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-ISC-orange.svg)]()

> A production-ready, feature-packed e-commerce web application with a responsive customer storefront, full administrative dashboard, dual payment gateways (Stripe & Razorpay), image asset management via Cloudinary, and robust backend security with rate limiting and price integrity checks.

---

## 🌐 Live Demos

- 🛍️ **Customer Storefront**: [https://forever-frontend-lemon-seven.vercel.app/](https://forever-frontend-lemon-seven.vercel.app/)
- 👑 **Admin Dashboard**: [https://ecommerce-app-pied-nine.vercel.app/](https://ecommerce-app-pied-nine.vercel.app/)

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │               CLIENT BROWSERS                │
                    ├──────────────────────┬───────────────────────┤
                    │   Customer Store     │    Admin Dashboard    │
                    │ (React 19 + Vite 7)  │  (React 19 + Vite 7)  │
                    │  [localhost:5173]    │   [localhost:5174]    │
                    └───────────┬──────────┴───────────┬───────────┘
                                │                      │
                                │   HTTPS / REST API   │
                                └──────────┬───────────┘
                                           │
                                ┌──────────▼──────────┐
                                │   EXPRESS 5 API     │
                                │  [localhost:4000]   │
                                ├─────────────────────┤
                                │ • Helmet Security   │
                                │ • IP Rate Limiting  │
                                │ • JWT Auth Guard    │
                                │ • Price Validation  │
                                │ • Multer File Guard │
                                └──────────┬──────────┘
                                           │
          ┌─────────────────┬──────────────┴───────┬─────────────────┐
          │                 │                      │                 │
┌─────────▼────────┐ ┌──────▼───────┐ ┌────────────▼───────────┐ ┌───▼────────────┐
│  MongoDB Atlas   │ │  Cloudinary  │ │        Stripe          │ │    Razorpay     │
│ (Database Store) │ │(Image CDN)   │ │ (Checkout & Card Pay)  │ │ (UPI / NetBank) │
└──────────────────┘ └──────────────┘ └────────────────────────┘ └─────────────────┘
```

---

## ✨ Features

### 🛍️ Customer Storefront (`/frontend`)
- **Product Catalog**: Dynamic search, category and sub-category multi-filtering, and bestseller tagging.
- **Interactive Cart**: Size selections, multi-quantity updates with debounced API synchronization.
- **Multi-Payment Checkout**:
  - 💵 **Cash on Delivery (COD)**
  - 💳 **Stripe Checkout** (Card & International Payments)
  - ⚡ **Razorpay** (UPI, Net Banking, Cards with cryptographic HMAC signature verification)
- **Order Tracking**: Real-time order status tracking with complete order history.
- **Responsive UI**: Mobile-first design styled with modern Tailwind CSS.

### 👑 Admin Management Panel (`/admin`)
- **Product Management**: Multi-image upload with Cloudinary processing, sizes, categories, and bestseller toggle.
- **Product Catalog Control**: Real-time inventory removal and listing.
- **Order Processing**: Update order fulfillment statuses (`Order Placed`, `Packing`, `Shipped`, `Out for delivery`, `Delivered`).
- **Protected Admin Gateway**: JWT role-based access control.

### 🛡️ Enterprise Security Hardening (`/backend`)
- **Server-Side Price Calculation**: Order totals are strictly verified against the database — zero client price-tampering risk.
- **Cryptographic Payment Verification**: HMAC SHA256 signatures for Razorpay and session verification for Stripe.
- **DDoS & Brute-Force Defense**: Express rate limiting on general API and strict limits on authentication endpoints.
- **HTTP Header Armor**: Helmet for CSP, XSS protection, HSTS, and X-Frame-Options.
- **Upload Hardening**: Multer MIME-type filters (images only) with 5MB caps and randomized file hashing.

---

## 📁 Repository Structure

```
ECOMMERCE_APP/
├── backend/                  # Express REST API
│   ├── config/               # MongoDB & Cloudinary connectors
│   ├── controllers/          # Business logic (User, Product, Cart, Order)
│   ├── middleware/           # JWT Auth, Admin Auth, Multer, Rate Limiter
│   ├── models/               # Mongoose Schemas (User, Product, Order)
│   ├── routes/               # Express Route Definitions
│   ├── .env.example          # Environment variable template
│   └── server.js             # API Entry point
│
├── frontend/                 # Customer Facing Store (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Global ShopContext state
│   │   ├── pages/            # Views (Home, Collection, Cart, PlaceOrder, Orders, Verify)
│   │   └── assets/           # Images & Icons
│   ├── .env.example          # Frontend environment template
│   └── vite.config.js        # Vite configuration
│
└── admin/                    # Admin Dashboard (React + Vite)
    └── vite-project/
        ├── src/              # Admin pages (Add, List, Orders, Login)
        ├── .env.example      # Admin environment template
        └── vite.config.js    # Admin Vite config
```

---

## 🚀 Quick Start Guide (Local Setup)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version `18.x` or higher)
- `npm` or `yarn`
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (or a local MongoDB instance)
- *(Optional for full features)* [Cloudinary](https://cloudinary.com/), [Stripe](https://stripe.com/), and [Razorpay](https://razorpay.com/) test accounts.

---

### 2. Clone the Repository

```bash
git clone https://github.com/Utkarsh1087/ECOMMERCE_APP.git
cd ECOMMERCE_APP
```

---

### 3. Environment Variables Configuration

Create a `.env` file in each of the three directories using the provided templates:

#### A. Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```env
PORT=4000
MONGODB_URI="your_mongodb_connection_string"

JWT_SECRET="your_jwt_secret_key"

ADMIN_EMAIL="admin@forever.com"
ADMIN_PASSWORD="YourStrongAdminPassword123"

CLOUDINARY_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
RAZORPAY_KEY_ID="rzp_test_your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

#### B. Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_BACKEND_URL="http://localhost:4000"
VITE_RAZORPAY_KEY_ID="rzp_test_your_razorpay_key_id"
```

#### C. Admin (`admin/vite-project/.env`)
Copy `admin/vite-project/.env.example` to `admin/vite-project/.env`:

```env
VITE_BACKEND_URL="http://localhost:4000"
```

---

### 🔑 Setting Up Admin Account & Password

The Admin Dashboard does not use self-registration; instead, the administrator account is securely configured via environment variables in the backend:

1. Open `backend/.env` (or set in your hosting platform environment variables):
   ```env
   ADMIN_EMAIL="admin@forever.com"
   ADMIN_PASSWORD="YourStrongAdminPassword123"
   ```
2. **Customizing Credentials**:
   - Replace `admin@forever.com` with your preferred administrative email.
   - Replace `YourStrongAdminPassword123` with a strong, secret password.
3. **Logging in to Admin Panel**:
   - Start the servers (see Step 4).
   - Navigate to the Admin Dashboard at **http://localhost:5174**.
   - Enter the exact `ADMIN_EMAIL` and `ADMIN_PASSWORD` you configured in `backend/.env`.
   - The backend validates these credentials and generates an authenticated Admin JWT session.

---

### 4. Install Dependencies & Run

You can install all dependencies across Backend, Frontend, and Admin at once from the root directory:

```bash
# From the root directory:
npm run install:all
```

Then open **three separate terminal windows** (or tabs) to start each service:

#### 🟢 Terminal 1: Backend API
```bash
npm run backend
# (or: cd backend && npm run dev)
```
> Server will start at **http://localhost:4000** and log `MongoDB connected`.

#### 🔵 Terminal 2: Customer Storefront
```bash
npm run frontend
# (or: cd frontend && npm run dev)
```
> Storefront will start at **http://localhost:5173**.

#### 🟣 Terminal 3: Admin Dashboard
```bash
npm run admin
# (or: cd admin/vite-project && npm run dev)
```
> Admin panel will start at **http://localhost:5174**.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | API Health Check |
| `POST` | `/api/user/register` | Public (Rate Limited) | Register a new user |
| `POST` | `/api/user/login` | Public (Rate Limited) | User login & token issuance |
| `POST` | `/api/user/admin` | Public (Rate Limited) | Admin login & admin token issuance |
| `GET` | `/api/product/list` | Public | Fetch all products |
| `POST` | `/api/product/single` | Public | Fetch single product details |
| `POST` | `/api/product/add` | Admin Only | Upload & add new product |
| `POST` | `/api/product/remove` | Admin Only | Delete product |
| `POST` | `/api/cart/get` | User | Get current user's cart |
| `POST` | `/api/cart/add` | User | Add item to user's cart |
| `POST` | `/api/cart/update` | User | Update quantity of item in cart |
| `POST` | `/api/order/place` | User | Place COD Order (Server calculated) |
| `POST` | `/api/order/stripe` | User | Create Stripe checkout session |
| `POST` | `/api/order/razorpay` | User | Create Razorpay order |
| `POST` | `/api/order/verifyStripe` | User | Verify Stripe transaction |
| `POST` | `/api/order/verifyRazorpay`| User | Cryptographic signature verification |
| `POST` | `/api/order/userorders` | User | Get user's order history |
| `POST` | `/api/order/list` | Admin Only | Get all customer orders |
| `POST` | `/api/order/status` | Admin Only | Update order fulfillment status |

---

## ☕ Developer Joke

> **Why do programmers prefer dark mode?**  
> *Because light attracts bugs.* 🐛💡

---

## ⭐ Show Your Support

If you found this project helpful, educational, or fun to explore, please consider giving it a **Star ⭐ on GitHub**! It motivates continued open-source development and feature additions.

[![Star on GitHub](https://img.shields.io/github/stars/Utkarsh1087/ECOMMERCE_APP?style=social)](https://github.com/Utkarsh1087/ECOMMERCE_APP)

---

**Happy Coding!** 🚀 Built with ❤️ by [Utkarsh](https://github.com/Utkarsh1087).
