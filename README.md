# 🚗 Any Car Solution — Full-Stack Car Rental Platform

A production-ready **MERN stack** car rental & servicing platform with **complete test automation** (UI + API), **CI/CD pipeline**, and **22+ auto-captured test screenshots**.

[![Playwright Tests](https://img.shields.io/badge/Playwright-3%2F3%20Passing-brightgreen)](https://github.com/Atef123Ahabab/any-car-solution/actions)
[![Newman API Tests](https://img.shields.io/badge/Newman-12%2F12%20Assertions-blue)](https://github.com/Atef123Ahabab/any-car-solution/actions)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)](https://www.mongodb.com/atlas)

> Renamed from **CARRENT-main** — this is a personal full-stack project demonstrating end-to-end development of a modern car rental system, with a comprehensive QA automation suite.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Overview](#-api-overview)
- [Testing](#-testing)
  - [UI Tests (Playwright + POM)](#ui-tests-playwright--page-object-model)
  - [API Tests (Postman + Newman)](#api-tests-postman--newman)
- [Test Evidence & Screenshots](#-test-evidence--screenshots)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Git Workflow](#-git-workflow)
- [Security Notes](#-security-notes)
- [Roadmap](#-roadmap--future-improvements)
- [Troubleshooting](#-troubleshooting)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Overview

**Any Car Solution** is a complete car rental & servicing platform built with the MERN stack. It supports:

- 🚗 Car listings with images, filters, and search
- 📅 Customer bookings with date ranges
- 🛠️ Vehicle servicing requests
- 💬 Real-time chat (Socket.io)
- 🤖 AI assistant for recommendations
- 👥 Role-based dashboards (customer, owner, admin)
- 🔐 JWT authentication with role-based access control

---

## ✨ Features

### 👤 Customer
- Browse cars with images, filters, and search history
- View detailed car pages
- Book cars for date ranges via modal
- Track and manage personal bookings
- Submit servicing requests and check status
- Real-time chat with owners (Socket.io)
- AI assistant for recommendations & queries

### 🧑‍💼 Owner / Admin
- Add, edit, delete car listings
- Upload car images (Multer)
- Manage bookings and approve/reject requests
- View and manage servicing requests
- Dashboard with statistics & reports
- Live customer conversations

### 🌐 General
- JWT-based authentication
- Role-based access control (customer vs owner)
- Search history tracking
- Mobile-responsive design
- Dark/light theme toggle
- Social media integration links
- Server status indicator

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- React Router DOM 7
- TailwindCSS 4 (plus custom CSS)
- Socket.io-client (real-time chat)
- Axios (HTTP)
- Context API / hooks

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose 8
- JWT (jsonwebtoken)
- bcrypt / bcryptjs (password hashing)
- Multer (file uploads)
- Socket.io (real-time messaging)
- OpenAI API (AI assistant)
- dotenv (env config)

**Testing**
- Playwright 1.64+ (UI automation)
- @playwright/test (test runner)
- Allure Playwright (rich reports)
- Newman 6.2+ (API test runner)
- newman-reporter-htmlextra (HTML reports)

**DevOps / Tooling**
- Nodemon (dev server)
- GitHub Actions (CI/CD)
- ESLint
- Render (deployment target — see `DEPLOYMENT_GUIDE.md`)

---

## 📁 Project Structure

```
any-car-solution/
├── .github/
│   └── workflows/
│       └── tests.yml                    # GitHub Actions CI
│
├── api-tests/                           # Postman + Newman API tests
│   ├── CarRental.postman_collection.json
│   ├── package.json
│   ├── newman-report.html              # Generated HTML report
│   └── README.md
│
├── client/                              # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                     # SVG icons + images
│   │   ├── components/                 # Reusable UI (Chat, AIAssistant, Navbar, ...)
│   │   ├── config/api.js               # Backend URL config
│   │   ├── hooks/                      # Custom hooks
│   │   ├── pages/                      # Route-level pages
│   │   │   └── Owner/                  # Owner-specific pages
│   │   ├── Styles/styles/              # CSS per component
│   │   ├── utils/                      # Helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                            # VITE_API_URL=http://localhost:3000
│   └── package.json
│
├── server/                              # Express backend
│   ├── configs/db.js                   # MongoDB connection
│   ├── controllers/                    # Route handlers
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification
│   │   └── upload.js                   # Multer config
│   ├── models/                         # Mongoose schemas
│   │   ├── user.js, Cars.js, Booking.js
│   │   ├── Service.js, Report.js
│   │   ├── SearchHistory.js, UserCars.js
│   │   └── chat.js
│   ├── routes/                         # Express routers
│   ├── uploads/cars/                   # Uploaded car images
│   ├── utils/                          # Seed scripts
│   ├── .env                            # MONGODB_URI, JWT_SECRET
│   ├── .env.example                    # Environment template
│   ├── server.js                       # Entry point
│   └── package.json
│
├── ui-tests/                            # Playwright UI tests
│   ├── tests/
│   │   ├── q1-invalid-login.spec.js
│   │   ├── q2-register-add-cart.spec.js
│   │   └── q3-e2e-checkout.spec.js
│   ├── pages/                          # Page Object Model
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── ProductPage.js
│   │   └── CartPage.js
│   ├── utils/
│   │   └── screenshotHelper.js         # Auto-screenshot helper
│   ├── screenshots/                    # 22 auto-captured PNGs
│   │   ├── Q1-invalid-login/
│   │   ├── Q2-register-and-browse/
│   │   └── Q3-e2e-flow/
│   ├── portfolio-shots/                # Portfolio hero images
│   ├── portfolio-screenshot.js         # Portfolio capture script
│   ├── playwright.config.js
│   ├── package.json
│   └── .gitignore
│
├── DEPLOYMENT_GUIDE.md
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm
- Git

### 1. Clone

```bash
git clone https://github.com/Atef123Ahabab/any-car-solution.git
cd any-car-solution
```

### 2. Install dependencies

```bash
# Root
npm install

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment

Create `server/.env` based on `server/.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/carrent
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=sk-...
CLIENT_URL=http://localhost:5174
```

**⚠️ Important:** MongoDB Atlas password must NOT contain `@`, `#`, `?`, `/`, `%`. URL-encode them or change your password.

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Run

**Backend** (terminal 1):
```bash
cd server
npm run dev
```

Expected output:
```
🚀 Server running on port 3000
📊 Database: MongoDB Atlas connected
MongoDB connected successfully on attempt 1
```

**Frontend** (terminal 2):
```bash
cd client
npm run dev
```

Expected output:
```
VITE v7.1.2  ready in XXX ms
➜  Local:   http://localhost:5174/
```

⚠️ **Always use `http://localhost:5174`** in your browser — NOT the network IP (`192.168.x.x`), which is blocked by CORS.

### 5. Seed sample data (optional)

```bash
cd server
node utils/seedDatabase.js
node utils/seedBookings.js
```

---

## 🔌 API Overview

| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| POST   | `/api/auth/register`  | Register new user       |
| POST   | `/api/auth/login`     | Login → JWT             |
| GET    | `/api/cars`           | List all cars           |
| GET    | `/api/cars/:id`       | Car details             |
| POST   | `/api/cars`           | Add car (owner)         |
| PUT    | `/api/cars/:id`       | Update car (owner)      |
| DELETE | `/api/cars/:id`       | Delete car (owner)      |
| POST   | `/api/bookings`       | Create booking          |
| GET    | `/api/bookings`       | List bookings           |
| POST   | `/api/services`       | Submit service request  |
| GET    | `/api/services`       | List service requests   |
| GET    | `/api/users/me`       | Current user profile    |
| WS     | `socket.io`           | Real-time chat          |

---

## 🧪 Testing

This project has **two comprehensive test suites** — UI and API.

### UI Tests (Playwright + Page Object Model)

**Location:** `ui-tests/`

#### Setup

```bash
cd ui-tests
npm install
npx playwright install chromium
```

#### Run tests

```bash
npm test                    # Run all 3 tests
npm run test:q1             # Just Q1
npm run test:q2             # Just Q2
npm run test:q3             # Just Q3
npm run test:headed         # Watch tests run in browser
npm run test:report         # Open HTML report
npm run allure:generate     # Build Allure report
npm run allure:open         # Open Allure report
```

#### Expected output

```
Running 3 tests using 1 worker

  ✓  1 tests/q1-invalid-login.spec.js:8:3 (7.3s)
  ✓  2 tests/q2-register-add-cart.spec.js:10:3 (10.9s)
  ✓  3 tests/q3-e2e-checkout.spec.js:10:3 (9.8s)

  3 passed (30.1s)
```

#### Test coverage

| Test | File | Purpose | Screenshots |
|---|---|---|---|
| **Q1** | `q1-invalid-login.spec.js` | Negative auth — verifies bad credentials are rejected with proper error message | 6 PNGs |
| **Q2** | `q2-register-add-cart.spec.js` | Register → Login → Browse — full user lifecycle with dynamic test data | 8 PNGs |
| **Q3** | `q3-e2e-checkout.spec.js` | E2E — login → browse → view car details | 8 PNGs |

#### Architecture — Page Object Model (POM)

Every page is encapsulated in a class:

```javascript
// ui-tests/pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = '#Email';
    this.passwordInput = '#Password';
    this.loginButton = 'input[value="Log in"]';
  }
  async goto() { await this.page.goto('/login'); }
  async login(email, password) { /* ... */ }
}
```

**Benefits:** Selectors isolated from test logic, reusable across tests, easy to maintain.

#### Auto-screenshot capture

Every test step automatically captures a full-page screenshot via:

```javascript
const { capture } = require('../utils/screenshotHelper');
await capture(page, 'Q1-invalid-login', 1, 'app-loaded');
// → saves to ui-tests/screenshots/Q1-invalid-login/step-01-app-loaded.png
```

#### Playwright config

`ui-tests/playwright.config.js`:
- ✅ HTML reporter (`playwright-report/`)
- ✅ Allure reporter (`allure-results/`)
- ✅ Screenshot on failure
- ✅ Trace on failure
- ✅ Sequential execution (`fullyParallel: false`)
- ✅ Single worker for deterministic state

---

### API Tests (Postman + Newman)

**Location:** `api-tests/`

#### Setup

```bash
cd api-tests
npm install
```

#### Run tests

```bash
npm test                    # Run collection via Newman CLI
npm run test:report         # Generate HTML report
```

#### Expected output

```
Car Rental API Tests

→ Step 1 — GET all cars
  GET http://localhost:3000/api/cars [200 OK, 1.23kB]
  ✓  Status 200
  ✓  Response has success:true
  ✓  Response has cars array

→ Step 2 — Register user (dynamic)
  POST http://localhost:3000/api/auth/register [201 Created]
  ✓  Status 200 or 201
  ✓  Has user object
  ✓  Has token

→ Step 3 — Login with JUST-REGISTERED user
  POST http://localhost:3000/api/auth/login [200 OK]
  ✓  Status 200
  ✓  Has token
  ✓  Returned user _id matches the registered user

→ Step 4 — Extract car id (variable chaining demo)
  GET http://localhost:3000/api/cars [200 OK]
  ✓  Status 200
  ✓  cars array exists
  ✓  Car has make and model

┌─────────────────────────┬────────────────────┬────────────────────┐
│              assertions │                 12 │                  0 │
└─────────────────────────┴────────────────────┴────────────────────┘
```

#### Test coverage — 12 assertions

| Step | Method | Endpoint | Assertions |
|---|---|---|---|
| 1 | GET | `/api/cars` | Status 200, `success:true`, `cars` array |
| 2 | POST | `/api/auth/register` | Status 200/201, has `user`, has `token` |
| 3 | POST | `/api/auth/login` | Status 200, has `token`, `_id` matches registered user |
| 4 | GET | `/api/cars` | Status 200, `cars` array, car has `make` + `model` |

#### Variable chaining

The collection demonstrates **dynamic variable chaining**:

1. **Step 2** registers a user → stores `user_id` and `user_email` in collection variables
2. **Step 3** uses `{{user_email}}` to log in with the freshly registered account
3. **Step 4** extracts the first car's `_id` and stores it for follow-up requests

#### Reports

Generated HTML report:
```bash
npm run test:report
# → api-tests/newman-report.html
open newman-report.html
```

The report includes:
- ✅ Pass/fail breakdown per step
- ✅ Response times per request
- ✅ Full request/response bodies
- ✅ Assertion details
- ✅ Console logs

---

## 📸 Test Evidence & Screenshots

### Auto-captured test screenshots (22 PNGs)

All test executions produce screenshots saved in `ui-tests/screenshots/`:

```
ui-tests/screenshots/
├── Q1-invalid-login/                    (6 screenshots)
│   ├── step-01-app-loaded.png
│   ├── step-02-login-modal-open.png
│   ├── step-03-invalid-credentials-filled.png
│   ├── step-04-after-submit.png
│   ├── step-05-error-displayed.png
│   └── step-06-still-not-logged-in.png
├── Q2-register-and-browse/              (8 screenshots)
│   ├── step-01-app-loaded.png
│   ├── step-02-login-modal-open.png
│   ├── step-03-signup-mode.png
│   ├── step-04-registration-form-filled.png
│   ├── step-05-registration-success.png
│   ├── step-06-login-form-with-new-account.png
│   ├── step-07-after-login.png
│   └── step-08-auth-state-checked.png
└── Q3-e2e-flow/                          (8 screenshots)
    ├── step-01-cars-page-loaded.png
    ├── step-02-login-modal-open.png
    ├── step-03-credentials-filled.png
    ├── step-04-after-login.png
    ├── step-05-auth-verified.png
    ├── step-06-cars-after-login.png
    ├── step-07-car-card-visible.png
    └── step-08-car-detail-link-not-found.png
```

**View them:**
```bash
open ui-tests/screenshots
```

### Portfolio screenshots

High-resolution 1920×1080 @ 2x Retina screenshots for portfolio use:

```bash
cd ui-tests
node portfolio-screenshot.js
open portfolio-shots
```

Captures:
- `01-home-full-page.png`
- `02-home-hero.png`
- `03-cars-page.png`
- `04-cars-full-page.png`
- `05-login-modal.png`
- `06-signup-form.png`
- `07-logged-in-view.png`

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**Workflow file:** `.github/workflows/tests.yml`

Runs automatically on:
- Every push to `main`
- Every pull request to `main`

**Pipeline steps:**
1. Checkout repo
2. Setup Node.js 20
3. Install server dependencies
4. Start server in background (with `MONGODB_URI` from secrets)
5. Install API test dependencies
6. Run Newman tests
7. Upload `newman-report.html` as artifact

**View runs:** https://github.com/Atef123Ahabab/any-car-solution/actions

### Add MongoDB secret

To make CI tests actually connect to Atlas:

1. Go to https://github.com/Atef123Ahabab/any-car-solution/settings/secrets/actions
2. Click **New repository secret**
3. Name: `MONGODB_URI`
4. Value: your MongoDB Atlas connection string
5. Save

---

## 🔀 Git Workflow

This project follows a **feature-branch workflow**:

```
main
 ├── feature/q1-invalid-login          # Test 1
 ├── feature/q2-register-add-cart      # Test 2
 ├── feature/q3-e2e-checkout           # Test 3
 ├── feature/api-tests                 # API collection
 ├── feature/test-screenshots          # Auto-screenshot helper
 └── feature/portfolio-screenshots     # Portfolio images
```

### Git history

```bash
git log --oneline --graph --all
```

Recent commits:
```
* ci: add GitHub Actions workflow for API tests
* docs(test): add 22 auto-captured test screenshots as evidence
* test(ui): add auto-screenshot capture at every test step
* docs(test): add testing section to README and package.json scripts
* test(api): add Postman collection with variable chaining and Newman CLI
* test(q3): rewrite E2E flow for car rental app
* test(q2): rewrite register+login+browse flow for car rental
* test(q1): rewrite invalid login test for car rental app
* fix(env): point client API to localhost:3000, fix MongoDB URI
```

### Commit conventions

- `feat:` — new feature
- `fix:` — bug fix
- `test:` — test changes
- `docs:` — documentation
- `ci:` — CI/CD changes
- `refactor:` — code refactoring

---

## 🔒 Security Notes

- ✅ `.env` files are gitignored — never commit them
- ✅ `node_modules/` and `server/uploads/` are gitignored
- ✅ Passwords hashed with bcrypt
- ✅ Routes protected with `authenticateToken` + `requireRole`
- ⚠️ Never hardcode secrets — use `process.env` only

---

## 📌 Roadmap / Future Improvements

- [ ] Payment gateway integration (Stripe / bKash)
- [ ] Advanced search filters
- [ ] Rating and review system
- [ ] Email verification & password reset
- [ ] Push notifications (PWA)
- [ ] Analytics dashboard
- [ ] Dockerize + CI/CD pipeline
- [x] **Unit & integration tests** (Playwright + Newman) ✅
- [x] **GitHub Actions CI** ✅
- [ ] Full TypeScript migration
- [ ] Multi-language support

---

## 🐛 Troubleshooting

### Server won't start

**Error:** `EADDRINUSE: address already in use :::3000`

**Fix:**
```bash
lsof -ti:3000 | xargs kill -9
cd server && npm run dev
```

### MongoDB won't connect

**Error:** `querySrv ENOTFOUND _mongodb._tcp.cluster0.xxxxx.mongodb.net`

**Fix 1:** Resume the cluster in MongoDB Atlas (clusters auto-pause after inactivity)

**Fix 2:** Flush DNS cache:
```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

**Fix 3:** Use Cloudflare DNS (`1.1.1.1`) instead of Google DNS (`8.8.8.8`) in System Settings → Network

**Fix 4:** Ensure password has NO special characters (`@`, `#`, `?`, `/`)

### Client shows "Failed to fetch"

**Cause:** Wrong API URL or CORS

**Fix:**
1. Ensure `client/.env` has `VITE_API_URL=http://localhost:3000`
2. Ensure server CORS allows `http://localhost:5174`
3. **Always use `http://localhost:5174`** in browser — NOT the IP `192.168.x.x`

### Playwright tests fail with "strict mode violation"

**Error:** `getByRole('button', { name: /^login$/i }) resolved to 2 elements`

**Cause:** Multiple elements match the selector

**Fix:** Use `.first()` (opens modal) or `.last()` (submits form)

### Newman HTML reporter missing

**Error:** `could not find "html" reporter`

**Fix:** Use `newman-reporter-htmlextra` (Newman v6 compatible):
```bash
npm install --save-dev newman-reporter-htmlextra
```

### Screenshots folder empty

**Cause:** Tests didn't run or crashed before capture

**Fix:** Check test output — screenshots are taken before each `expect` fails

---

## 👤 Author

**Atef Ahabab**
GitHub: [@Atef123Ahabab](https://github.com/Atef123Ahabab)
Project: [any-car-solution](https://github.com/Atef123Ahabab/any-car-solution)

---

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

**⭐ If this project helped you, please give it a star on GitHub!**