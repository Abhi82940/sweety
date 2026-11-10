# Sweety — Blood Glucose Tracking and Reporting System

![Sweety](screenshots/04_dashboard.png)

Sweety is a full-stack medical web application designed for diabetes patients to log, track, and analyze their daily blood glucose levels with precision, clinical structure, and actionable insights.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture & Project Structure](#architecture--project-structure)
5. [Prerequisites](#prerequisites)
6. [PostgreSQL Database Setup & Schema](#postgresql-database-setup--schema)
7. [Environment Configuration](#environment-configuration)
8. [Installation & Setup](#installation--setup)
9. [Running the Application](#running-the-application)
10. [Running the Test Suites](#running-the-test-suites)
11. [Seed Data & Demo Credentials](#seed-data--demo-credentials)
12. [REST API Documentation](#rest-api-documentation)
13. [Clinical Validation Rules](#clinical-validation-rules)
14. [Report Calculation Logic](#report-calculation-logic)
15. [Deployment Guide (Render + Vercel + Neon)](#deployment-guide)
16. [Docker Deployment](#docker-deployment)
17. [Assumptions, Limitations & Future Roadmap](#assumptions-limitations--future-roadmap)

---

## 🌟 Project Overview
Diabetes mellitus requires structured self-monitoring of blood glucose (SMBG). Sweety provides:
- Structured monitoring strictly aligned with **4 daily clinical slots** (Fasting Morning, After Breakfast, After Lunch, After Dinner).
- Enforced clinical validation rules preventing invalid values, future dates, or duplicate readings.
- Comprehensive clinical analytics across **Daily**, **Month-to-Date**, and **Previous Calendar Month** timeframes.
- High-performance, multi-tenant isolation where users only ever see their own records.
- Zero mock data in production — all metrics and Recharts visualizations are derived directly from the PostgreSQL relational database.

---

## ✨ Key Features
- **Authentication & Security**: Secure registration and login with bcrypt password hashing (10 salt rounds) and signed JWT tokens with 7-day expiration.
- **Dedicated Time Slots**:
  1. `Morning (fasting)` (Target: 70 – 99 mg/dl)
  2. `After breakfast` (Target: < 140 mg/dl)
  3. `After lunch` (Target: < 140 mg/dl)
  4. `After dinner` (Target: < 140 mg/dl)
- **Comprehensive Daily Dashboard**:
  - Live welcome card with date picker (defaults to today).
  - 5 Key KPI cards: Total Readings Today, Latest Glucose Value, Daily Average, Daily Peak (Highest), and Daily Valley (Lowest).
  - 4 Daily Slot Cards with quick "Record Slot" and "Edit" workflows.
  - Month-to-Date interactive glycemic trend curve with ADA target range reference lines.
  - Recent readings log with quick edit triggers.
- **Full Reading History**:
  - Filterable by specific date and time slot.
  - Pagination controls (`page` and `limit`).
  - Delete with modal confirmation dialog.
  - One-click CSV export for physician visits.
- **Clinical Reporting Suite**:
  - **Daily Report**: Single day breakdown.
  - **Month-to-Date Report**: First day of the selected month to the selected date inclusive.
  - **Monthly Report**: Complete previous calendar month (e.g. 1 Sept – 30 Sept for an October date).
  - Aggregates: Highest, Lowest, Average rounded to one decimal place, Total readings count.
  - Responsive Recharts bar chart for daily slots and area curve for monthly trends.
  - Empty reports gracefully handled with clear messaging.

---

## 🛠 Technology Stack

### Frontend
- **React.js 19** with **Vite**
- **JavaScript (ES Modules)**
- **Tailwind CSS v4** for clean, medical-grade styling
- **React Router DOM v7**
- **Axios** (with JWT request interceptors & automatic 401 handling)
- **Recharts** (AreaChart, BarChart, ResponsiveContainer)
- **Lucide React** (healthcare and navigation icons)
- **React Toastify** for notification toasts
- **Vitest** for frontend unit testing

### Backend
- **Node.js** (v20+)
- **Express.js** REST API
- **PostgreSQL** (`pg` connection pool with SSL support)
- **JSON Web Tokens (`jsonwebtoken`)**
- **bcryptjs** password encryption
- **express-validator** for request payload validation
- **helmet** for HTTP security headers
- **cors** for fine-grained origin access control
- **express-rate-limit** for brute-force protection on auth endpoints

### Testing
- **Jest** & **Supertest** for comprehensive backend test suites
- **Vitest** for frontend helper & clinical classification tests

---

## 📁 Architecture & Project Structure

```
sweety/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AddReadingModal.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── GlucoseBadge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── SlotCard.jsx
│   │   ├── context/            # React AuthContext
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/            # Application layout wrapper
│   │   │   └── AppLayout.jsx
│   │   ├── pages/              # Primary view pages
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ReadingHistoryPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── services/           # Axios instance & interceptors
│   │   │   └── api.js
│   │   ├── utils/              # Clinical classification & CSV export
│   │   │   ├── helpers.js
│   │   │   └── helpers.test.js
│   │   ├── App.jsx             # React Router routing setup
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # Entry point
│   ├── Dockerfile              # Production multi-stage Nginx container
│   ├── nginx.conf              # SPA routing fallback config
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── server/                     # Express.js REST API
│   ├── src/
│   │   ├── config/             # Database connection pool (`pg`)
│   │   │   └── db.js
│   │   ├── controllers/        # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── reading.controller.js
│   │   │   └── report.controller.js
│   │   ├── middleware/         # Security & JWT authentication
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── routes/             # Express API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── reading.routes.js
│   │   │   └── report.routes.js
│   │   ├── utils/              # JWT signing & verification
│   │   │   └── jwt.js
│   │   ├── validators/         # Input & 5 Clinical Business Rules
│   │   │   ├── auth.validator.js
│   │   │   └── reading.validator.js
│   │   ├── app.js              # Express application configuration
│   │   └── server.js           # Server bootstrap & listener
│   ├── scripts/                # Database initialization & testing scripts
│   │   ├── check-db.js
│   │   ├── init-db.js
│   │   └── take-screenshots.js
│   ├── tests/                  # Jest + Supertest 19-test suite
│   │   └── api.test.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── database/                   # Relational database schema & seeds
│   ├── schema.sql              # PostgreSQL DDL with constraints & indexes
│   └── seed.js                 # Idempotent demo user & readings seed script
│
├── screenshots/                # Automated full-page screenshots
│   ├── 01_landing_page.png
│   ├── 02_login_page.png
│   ├── 03_register_page.png
│   ├── 04_dashboard.png
│   ├── 05_add_reading_modal.png
│   ├── 06_reading_history.png
│   ├── 07_reports_daily.png
│   ├── 08_reports_month_to_date.png
│   └── 09_profile_page.png
│
├── docker-compose.yml          # Full-stack container orchestration
├── .gitignore
├── package.json                # Root package for workspace orchestration
└── README.md
```

---

## ⚙️ Prerequisites
- **Node.js**: version 20.x or higher
- **npm**: version 10.x or higher
- **PostgreSQL**: local instance or cloud provider like [Neon](https://neon.tech) / AWS RDS

---

## 🗄 PostgreSQL Database Setup & Schema
Sweety uses a dedicated PostgreSQL schema (`sweety`) to prevent conflicts in shared databases.

### Schema Definition (`database/schema.sql`):
```sql
CREATE SCHEMA IF NOT EXISTS sweety;

CREATE TABLE IF NOT EXISTS sweety.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sweety.readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES sweety.users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_glucose_range CHECK (glucose_value >= 40 AND glucose_value <= 600),
    CONSTRAINT chk_time_slot CHECK (time_slot IN (
        'Morning (fasting)',
        'After breakfast',
        'After lunch',
        'After dinner'
    )),
    CONSTRAINT uq_user_reading_slot UNIQUE (user_id, reading_date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_sweety_users_email ON sweety.users(email);
CREATE INDEX IF NOT EXISTS idx_sweety_readings_user_id ON sweety.readings(user_id);
CREATE INDEX IF NOT EXISTS idx_sweety_readings_user_date ON sweety.readings(user_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_sweety_readings_user_date_slot ON sweety.readings(user_id, reading_date, time_slot);
```

To run the schema migration against your database:
```bash
cd sweety/server
npm run init:db
```

---

## 🔐 Environment Configuration

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/sweety_db?sslmode=disable
JWT_SECRET=your_super_secret_jwt_key_sweety_2026_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/sweety.git
   cd sweety
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Initialize database schema and seed data:**
   ```bash
   cd ../server
   npm run init:db
   npm run seed
   ```

---

## 💻 Running the Application

### Option A: From root directory
```bash
# Run server
npm run dev:server

# Run client (in separate terminal)
npm run dev:client
```

### Option B: From subdirectories
- **Backend**:
  ```bash
  cd server
  npm run dev
  # Server starts on http://localhost:5000
  ```
- **Frontend**:
  ```bash
  cd client
  npm run dev
  # Client starts on http://localhost:5173
  ```

---

## 🧪 Running the Test Suites

### Backend Jest Test Suite (19 Comprehensive Tests):
The backend test suite runs with Supertest against an isolated test user and covers all requirements:
```bash
cd server
npm test
```

#### Test Cases Verified:
1. `Successful registration` (201 Created with JWT)
2. `Duplicate email registration` (409 Conflict)
3. `Successful login` (200 OK with JWT)
4. `Incorrect password` (401 Unauthorized)
5. `Unauthorized reading access` (401 Unauthorized without Bearer token)
6. `Add valid reading` (201 Created)
7. `Missing glucose value` (400 "Please enter a glucose value.")
8. `Value below 40` (400 "Value must be between 40 and 600 mg/dl.")
9. `Value above 600` (400 "Value must be between 40 and 600 mg/dl.")
10. `Decimal glucose value` (400 "Value must be between 40 and 600 mg/dl.")
11. `Duplicate time slot` (400 "You already have a [Slot] reading for this date.")
12. `More than four readings per day` (400 "You can add only 4 readings per day.")
13. `Future date` (400 "Date cannot be in the future.")
14. `Edit reading` (200 OK allowing current slot retention)
15. `Delete reading` (200 OK with ownership verification)
16. `Daily report calculations` (Highest, Lowest, Average, Total)
17. `Month-to-date report calculations` (1st of month to date inclusive)
18. `Previous month report calculations` (Complete previous calendar month)
19. `Empty report handling` (Returns 0 count and null values without throwing)

### Frontend Unit Tests (Vitest):
```bash
cd client
npm test
```
Verifies clinical classification (Normal, Pre-diabetes, High, Hypoglycemia) and date formatting.

---

## 👤 Seed Data & Demo Credentials

The database seed script is completely idempotent (safe to rerun repeatedly without duplicating records):
```bash
cd server
npm run seed
```

### Demo Login Credentials:
- **Email**: `demo@sweety.com`
- **Password**: `SweetyDemo@123`
- **Name**: `Sweety Demo`

*Tip: On the Sweety Login screen, click **"Fill Demo Info"** to automatically populate these credentials.*

---

## 📡 REST API Documentation

### Authentication Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register user with name, email, password | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | **Yes** |

### Reading Management Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/readings` | Create reading with date, slot, and value | **Yes** |
| `GET` | `/api/readings` | Get readings with optional `date`, `page`, `limit` | **Yes** |
| `GET` | `/api/readings/:id` | Get single reading by ID | **Yes** |
| `PUT` | `/api/readings/:id` | Update reading value or date/slot | **Yes** |
| `DELETE` | `/api/readings/:id` | Delete reading by ID | **Yes** |

### Report Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reports/daily?date=YYYY-MM-DD` | Daily stats and readings | **Yes** |
| `GET` | `/api/reports/month-to-date?date=YYYY-MM-DD` | 1st of month to selected date | **Yes** |
| `GET` | `/api/reports/monthly?date=YYYY-MM-DD` | Complete previous calendar month | **Yes** |

### System Health
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status and timestamp | No |

---

## 🛡 Clinical Validation Rules

Sweety enforces 5 strict business rules on both backend and frontend:

1. **RULE 1 — Value is Required:**
   - Message: `"Please enter a glucose value."`
2. **RULE 2 — Whole Number between 40 and 600:**
   - Message: `"Value must be between 40 and 600 mg/dl."`
   - Rejects non-integers (e.g. `120.5`), values `< 40`, and values `> 600`.
3. **RULE 3 — Only One Reading Per Slot Per Day:**
   - Message: `"You already have an [After lunch] reading for this date."`
   - Database constraint: `UNIQUE (user_id, reading_date, time_slot)`
4. **RULE 4 — Maximum Four Readings Per Day:**
   - Message: `"You can add only 4 readings per day."`
5. **RULE 5 — Date Cannot Be in the Future:**
   - Message: `"Date cannot be in the future."`

*Note on Editing*: When updating an existing reading, the current reading is allowed to keep its existing time slot without triggering duplicate slot or 4-reading limit errors.

---

## 📊 Report Calculation Logic

1. **Daily Report**:
   - Query: `reading_date = selected_date`
   - Calculates Highest, Lowest, Average (rounded to 1 decimal place), and Total count.
2. **Month-to-Date Report**:
   - Query: `reading_date >= 'YYYY-MM-01' AND reading_date <= selected_date`
   - Groups by date for Recharts trend analysis.
3. **Monthly Report (Previous Calendar Month)**:
   - Query: Complete previous month (e.g. `2026-09-01` to `2026-09-30` for October 2026). Correctly accounts for month length (28/29/30/31 days) and January-to-December year transitions.

---

## 🌐 Deployment Guide

### Recommended Stack
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech)
- **Backend**: [Render](https://render.com) (Web Service)
- **Frontend**: [Vercel](https://vercel.com) (Vite SPA)

### 1. Database (Neon)
1. Create a project on [Neon](https://neon.tech).
2. Copy the Connection String (URI).
3. Set the `DATABASE_URL` environment variable.
4. Run `npm run init:db` and `npm run seed`.

### 2. Backend (Render)
1. Connect your GitHub repository to Render.
2. Choose **Web Service** with:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `DATABASE_URL`: Your Neon connection string (`?sslmode=require`)
   - `JWT_SECRET`: A secure 32+ character string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://sweety.vercel.app`)

### 3. Frontend (Vercel)
1. Import repository into Vercel.
2. Configure project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://sweety-api.onrender.com/api`)

---

## 🐳 Docker Deployment

To launch PostgreSQL, the backend API, and the React frontend with a single command:
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 📌 Assumptions, Limitations & Future Roadmap

### Assumptions
- Patients measure blood glucose primarily in `mg/dl` (milligrams per deciliter), the standard unit in North America and India.
- The 4 clinical slots map to primary diabetes monitoring times (Fasting, Post-Breakfast, Post-Lunch, Post-Dinner).

### Limitations
- Does not currently integrate directly with Bluetooth continuous glucose monitors (CGMs) like Dexcom or Abbott FreeStyle Libre via direct BLE.
- User accounts are currently single-role (patient); doctor/clinician sharing portals are targeted for Phase 2.

### Future Roadmap
- Automatic mmol/L to mg/dl unit toggle.
- Doctor / Caregiver viewing permissions and PDF clinical summary generation.
- Insulin dose and carbohydrate meal logging integration.
- Offline PWA (Progressive Web App) support with automatic syncing.
