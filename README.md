<div align="center">

  # 🍎 NutriScan

  **A modern full-stack web application built with React, Node.js, Express, and MySQL for scanning food barcodes to instantly reveal nutritional insights, Nutri-Score, NOVA classifications, and personalized health feedback.**

  [![Live App](https://img.shields.io/badge/Live_App-nutriscanwebapp-10b981?style=for-the-badge&logo=render)](https://nutriscanwebapp.onrender.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

<br />

## ✨ Features

### 🔍 Product Scanning
- 📷 **Camera Barcode Scanning** — Instantly scan packaged food barcodes using your device's camera via `html5-qrcode` integration in React.
- ⌨️ **Manual Barcode Entry** — Type or paste an 8, 12, or 13-digit EAN/UPC barcode number when camera access is unavailable.
- 📝 **Community Submissions** — If a product isn't found, submit its details manually via an intuitive form; NutriScan automatically uploads it to Open Food Facts.

### 📊 Nutritional Analysis
- 🏅 **Nutri-Score Calculation** — Official FSA-NPS algorithm calculates A–E grades, with automatic beverage detection for accurate scoring.
- 🧪 **NOVA Classification** — See how processed a food product is (Groups 1–4).
- 🍽️ **Full Nutrition Facts** — Energy, protein, carbs, sugars, fat, saturated fat, fiber, and sodium per 100g.
- 🧬 **Ingredients & Additives** — View full ingredient lists with additive detection and warnings.

### 👤 User Accounts & Personalization
- 🔐 **JWT Authentication** — Secure registration and login with email/password and persistent session management.
- 📧 **Email OTP Verification** — Account verification via 6-digit OTP sent through Nodemailer / Brevo API.
- 🔑 **Password Recovery** — Forgot password flow with OTP-based reset.
- 🏥 **Health Profile** — Configure health conditions (diabetes, hypertension), allergies, and dietary preferences (vegan, keto, etc.).
- ⚠️ **Personalized Warnings** — Get real-time alerts if a scanned product conflicts with your personal health profile.
- 💡 **Smart Suggestions** — Automatic recommendations based on nutritional content (e.g., "Good source of fiber").

### 📱 Activity Tracking
- 📜 **Scan History** — Browse your complete history of scanned products.
- ❤️ **Favorites** — Save and manage your favorite products for quick reference.

### 🎨 Premium UI/UX
- 🌗 **Dark/Light Mode** — Dynamic theme toggling managed via React Context (`ThemeContext`) with smooth CSS transitions.
- ✨ **Glassmorphism Design** — Custom glass-card UI design system with micro-animations and glowing accent borders.
- ⚡ **Skeleton Loading** — Shimmering skeleton states during data fetches and image rendering.
- 📱 **Fully Responsive** — Collapsible sidebar navigation with mobile drawer header controls.

---

## 🛠️ Tech Stack

| Layer         | Technology                                                    |
|---------------|---------------------------------------------------------------|
| **Frontend**  | React 19, Vite 6, React Router DOM v7, Phosphor Icons (`@phosphor-icons/react`), html5-qrcode |
| **State Mgt** | React Context API (`AuthContext`, `NavigationContext`, `ThemeContext`, `ToastContext`) |
| **Backend**   | Node.js (≥18), Express.js 5                                   |
| **Database**  | MySQL (Aiven Cloud / Local) with Sequelize ORM (Prisma supported) |
| **Auth**      | JWT (`jsonwebtoken`) + `bcrypt` password hashing              |
| **Email**     | Nodemailer / Brevo (Sendinblue) transactional email API       |
| **Food APIs** | Open Food Facts API, Spoonacular API (fallback)               |
| **Scoring**   | `nutri-score` npm package (official FSA-NPS algorithm)        |
| **Deployment**| Render (Web Service)                                          |

---

## 📁 Project Structure

```
NutriScan/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize connection & Aiven SSL setup
│   ├── controllers/
│   │   ├── authController.js    # Register, login, OTP verification, password reset
│   │   ├── productController.js # Scan, history, favorites, manual submission
│   │   └── profileController.js # User health profile CRUD operations
│   ├── middlewares/
│   │   └── authMiddleware.js    # JWT token verification middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── UserProfile.js
│   │   ├── ProductScanHistory.js
│   │   ├── SavedProduct.js
│   │   ├── ProductSubmission.js
│   │   ├── NutritionAnalysisResult.js
│   │   ├── UserFeedback.js
│   │   └── index.js             # Sequelize associations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── profileRoutes.js
│   ├── services/
│   │   ├── foodApi.js           # Multi-source food API fetcher (OFF + Spoonacular)
│   │   └── personalization.js   # Dynamic health profile conflict engine
│   └── server.js                # Express app entry point & static backend host
├── frontend/
│   ├── public/                  # Static assets for Vite
│   ├── src/
│   │   ├── components/          # React views and UI components
│   │   │   ├── Modals/          # Delete & Logout dialog modals
│   │   │   ├── AuthView.jsx     # User authentication (Login/Register)
│   │   │   ├── ChoiceView.jsx   # Scanner mode selector
│   │   │   ├── ForgotPasswordView.jsx
│   │   │   ├── HistoryFavoritesView.jsx
│   │   │   ├── LoadingView.jsx  # Shimmer skeleton component
│   │   │   ├── ManualEntryView.jsx
│   │   │   ├── ManualFallbackView.jsx # Missing product contribution form
│   │   │   ├── MobileHeader.jsx
│   │   │   ├── OtpView.jsx      # Email OTP verification
│   │   │   ├── ProfileView.jsx  # Health preferences form
│   │   │   ├── ResetPasswordView.jsx
│   │   │   ├── ResultsView.jsx  # Product detail & nutritional analysis card
│   │   │   ├── ScannerView.jsx  # Camera barcode scanner component
│   │   │   ├── Sidebar.jsx      # Responsive navigation drawer
│   │   │   └── ToastContainer.jsx # Notification alert manager
│   │   ├── context/             # Global React Context providers
│   │   │   ├── AuthContext.jsx  # JWT token & user state
│   │   │   ├── NavigationContext.jsx # View route switcher
│   │   │   ├── ThemeContext.jsx # Light/Dark mode state
│   │   │   └── ToastContext.jsx # Global status messages
│   │   ├── services/
│   │   │   └── api.js           # Frontend Axios HTTP client
│   │   ├── utils/
│   │   │   └── healthScore.js   # Client-side nutritional scoring helpers
│   │   ├── App.jsx              # Core application layout container
│   │   ├── App.css              # Component styling
│   │   ├── index.css            # Glassmorphism design system & CSS tokens
│   │   └── main.jsx             # React root mount point
│   ├── package.json             # Frontend dependencies & Vite scripts
│   └── vite.config.js           # Vite configuration (builds directly to ../public)
├── public/                      # Compiled Vite build output (served by Express in production)
├── setup-db.js                  # Database table initializer script
├── .env                         # Environment variables (not committed)
├── package.json                 # Workspace root scripts & backend dependencies
└── README.md
```

---

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

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** ≥ 18
- **MySQL** (Local MySQL server or cloud instance such as Aiven)

### 1. Clone the Repository
```bash
git clone https://github.com/Jit-Halder/NutriScan.git
cd NutriScan
```

### 2. Install Dependencies
Install dependencies for both the root (backend) and the React frontend:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000

# Database (Local MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nutriscan
DB_PORT=3306

# Or use connection URI for cloud MySQL (e.g., Aiven):
# DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your_jwt_secret_key

# External Food APIs
SPOONACULAR_API_KEY=your_spoonacular_api_key

# Email (Brevo / Nodemailer)
EMAIL_USER=your_email@example.com
BREVO_API_KEY=your_brevo_api_key

# Open Food Facts Write Credentials (Optional)
OFF_USER_ID=your_off_username
OFF_PASSWORD=your_off_password
```

### 4. Initialize Database
Initialize the database tables:
```bash
npm run db:setup
```

### 5. Run in Development Mode

Run the Express backend API and Vite React frontend concurrently:

- **Option A: Run Frontend & Backend Simultaneously (2 Terminals)**

  **Terminal 1 (Backend Server on `http://localhost:3000`):**
  ```bash
  npm run dev
  ```

  **Terminal 2 (React Vite Dev Server on `http://localhost:5173`):**
  ```bash
  npm run dev:frontend
  ```

  > Vite dev server automatically proxies `/api/*` calls to the backend on `http://localhost:3000`.

### 6. Production Build & Run
To test the production build locally:

```bash
# Compile React frontend into root public/ directory
npm run build

# Start production Express server
npm start
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Deployment

The application is deployed on **[Render](https://render.com/)** as a Web Service.

- **Live URL:** [https://nutriscanwebapp.onrender.com/](https://nutriscanwebapp.onrender.com/)
- **Build Command:** `npm run build` (compiles React frontend into `public/` directory via Vite)
- **Start Command:** `npm start` (`node backend/server.js`)
- **Database:** Hosted on **Aiven Cloud** (managed MySQL with SSL configuration).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.

---

<div align="center">
  Built with 💻 and ☕ by <strong>Jit Halder</strong>
</div>

