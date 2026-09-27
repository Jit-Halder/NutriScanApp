<div align="center">

  # 🍎 NutriScan

  **A full-stack web application for scanning food barcodes to instantly reveal nutritional insights, Nutri-Score, NOVA classifications, and personalized health feedback based on your profile.**

  [![Live App](https://img.shields.io/badge/Live_App-nutriscanwebapp-10b981?style=for-the-badge&logo=render)](https://nutriscanwebapp.onrender.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

<br />

## ✨ Features

### 🔍 Product Scanning
- 📷 **Camera Barcode Scanning** — Instantly scan packaged food barcodes using your device's camera via the html5-qrcode library.
- ⌨️ **Manual Barcode Entry** — Type or paste a barcode number when camera access isn't available.
- 📝 **Community Submissions** — If a product isn't found, submit its details manually; NutriScan automatically uploads it to Open Food Facts.

### 📊 Nutritional Analysis
- 🏅 **Nutri-Score Calculation** — Official FSA-NPS algorithm calculates A–E grades, with automatic beverage detection for accurate scoring.
- 🧪 **NOVA Classification** — See how processed a food product is (Groups 1–4).
- 🍽️ **Full Nutrition Facts** — Energy, protein, carbs, sugars, fat, saturated fat, fiber, and sodium per 100g.
- 🧬 **Ingredients & Additives** — View full ingredient lists with additive detection and warnings.

### 👤 User Accounts & Personalization
- 🔐 **JWT Authentication** — Secure registration and login with email/password.
- 📧 **Email OTP Verification** — Account verification via 6-digit OTP sent through Brevo (Sendinblue) API.
- 🔑 **Password Recovery** — Forgot password flow with OTP-based reset.
- 🏥 **Health Profile** — Configure health conditions (diabetes, hypertension), allergies, and dietary preferences (vegan, keto, etc.).
- ⚠️ **Personalized Warnings** — Get real-time alerts if a scanned product conflicts with your health profile.
- 💡 **Smart Suggestions** — Automatic recommendations based on nutritional content (e.g., "Good source of fiber").

### 📱 Activity Tracking
- 📜 **Scan History** — Browse your complete history of scanned products.
- ❤️ **Favorites** — Save and manage your favorite products for quick reference.

### 🎨 Premium UI/UX
- 🌗 **Dark/Light Mode** — System-aware theme toggling with smooth transitions.
- ✨ **Glassmorphism Design** — Modern glass-card UI with subtle micro-animations.
- ⚡ **Skeleton Loading** — Shimmering skeleton states for a responsive feel during data fetches.
- 📱 **Fully Responsive** — Sidebar navigation collapses into a mobile-friendly drawer on smaller screens.

## 🛠️ Tech Stack

| Layer         | Technology                                                    |
|---------------|---------------------------------------------------------------|
| **Frontend**  | Vanilla HTML5, CSS3, JavaScript (ES6+)                        |
| **Backend**   | Node.js, Express.js 5                                         |
| **Database**  | MySQL (Aiven Cloud) with Sequelize ORM                        |
| **Auth**      | JWT (jsonwebtoken) + bcrypt password hashing                  |
| **Email**     | Brevo (Sendinblue) transactional email API                    |
| **Food APIs** | Open Food Facts API, Spoonacular API (fallback)               |
| **Scoring**   | `nutri-score` npm package (official FSA-NPS algorithm)        |
| **Deployment**| Render (Web Service)                                          |

## 📁 Project Structure

```
NutriScan/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize connection (local & cloud)
│   ├── controllers/
│   │   ├── authController.js    # Register, login, OTP, password reset
│   │   ├── productController.js # Scan, history, favorites, submissions
│   │   └── profileController.js # User health profile CRUD
│   ├── middlewares/
│   │   └── authMiddleware.js    # JWT token verification
│   ├── models/
│   │   ├── User.js
│   │   ├── UserProfile.js
│   │   ├── ProductScanHistory.js
│   │   ├── SavedProduct.js
│   │   ├── ProductSubmission.js
│   │   ├── NutritionAnalysisResult.js
│   │   ├── UserFeedback.js
│   │   └── index.js             # Model associations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── profileRoutes.js
│   ├── services/
│   │   ├── foodApi.js           # OFF + Spoonacular multi-source fetcher
│   │   └── personalization.js   # Health-profile-based feedback engine
│   └── server.js                # Express app entry point
├── public/
│   ├── css/
│   │   └── styles.css           # Complete design system
│   ├── js/
│   │   ├── api.js               # Frontend API client
│   │   ├── app.js               # Main application logic & SPA routing
│   │   ├── health-score.js      # Client-side score utilities
│   │   └── scanner.js           # Camera barcode scanner integration
│   └── index.html               # Single Page Application shell
├── .env                         # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | `/api/auth/register`        | Register a new user            |
| POST   | `/api/auth/verify-otp`      | Verify email with OTP          |
| POST   | `/api/auth/resend-otp`      | Resend verification OTP        |
| POST   | `/api/auth/login`           | Login and receive JWT          |
| GET    | `/api/auth/me`              | Get current user (protected)   |
| POST   | `/api/auth/forgot-password` | Request password reset OTP     |
| POST   | `/api/auth/reset-password`  | Reset password with OTP        |
| DELETE | `/api/auth/delete-account`  | Permanently delete account     |

### Products
| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| GET    | `/api/products/scan/:barcode`    | Scan barcode & get analysis        |
| GET    | `/api/products/history`          | Get user's scan history            |
| POST   | `/api/products/submit`           | Submit a missing product           |
| GET    | `/api/products/favorites`        | Get user's saved favorites         |
| POST   | `/api/products/favorites/toggle` | Add/remove product from favorites  |
| GET    | `/api/products/favorites/:barcode` | Check if product is favorited    |

### Profile
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | `/api/profile`      | Get user health profile  |
| PUT    | `/api/profile`      | Update health profile    |

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** ≥ 18
- **MySQL** (local instance or cloud provider like Aiven)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jit-Halder/NutriScan
   cd NutriScan
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the project root:
   ```env
   PORT=3000

   # Database (local)
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=nutriscan
   DB_PORT=3306

   # Or use a connection URI for cloud MySQL:
   # DATABASE_URL=mysql://user:password@host:port/database

   # Auth
   JWT_SECRET=your_jwt_secret

   # Food APIs
   SPOONACULAR_API_KEY=your_spoonacular_key

   # Email (Brevo)
   EMAIL_USER=your_email@example.com
   BREVO_API_KEY=your_brevo_api_key

   # Open Food Facts Write Credentials (optional)
   OFF_USER_ID=your_off_username
   OFF_PASSWORD=your_off_password
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

5. **Or start in production mode:**
   ```bash
   npm start
   ```

## 🌐 Deployment

The app is deployed on **[Render](https://render.com/)** as a Web Service.

- **Live URL:** [https://nutriscanwebapp.onrender.com/](https://nutriscanwebapp.onrender.com/)
- The Express server serves the static frontend from the `public/` directory and handles all API routes.
- Database is hosted on **Aiven** (managed MySQL with SSL).

## 📜 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.

---
<div align="center">
  Built with 💻 and ☕ by <strong>Jit Halder</strong>
</div>
