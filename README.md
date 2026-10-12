# 🚗 Any Car Solution

A full-stack **car rental & servicing platform** built with the MERN stack. It supports car listings, customer bookings, vehicle servicing requests, real-time chat, an AI assistant, and role-based dashboards for customers and owners.

> Renamed from **CARRENT-main** — this is a personal full-stack project demonstrating end-to-end development of a modern car rental system.

---

## 📋 Features

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

**DevOps / Tooling**
- Nodemon (dev server)
- ESLint
- Render (deployment target — see `DEPLOYMENT_GUIDE.md`)

---

## 📁 Project Structure

```
any-car-solution/
├── client/                          # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── assets/                  # SVG icons + images
│       ├── components/              # Reusable UI (Chat, AIAssistant, Navbar, ...)
│       ├── config/api.js            # Backend URL config
│       ├── hooks/                   # Custom hooks
│       ├── pages/                   # Route-level pages
│       │   └── Owner/               # Owner-specific pages
│       ├── Styles/styles/           # CSS per component
│       ├── utils/                   # Helpers
│       ├── App.jsx
│       └── main.jsx
│
├── server/                          # Express backend
│   ├── configs/db.js                # MongoDB connection
│   ├── controllers/                 # Route handlers
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   └── upload.js                # Multer config
│   ├── models/                      # Mongoose schemas
│   │   ├── user.js, Cars.js, Booking.js
│   │   ├── Service.js, Report.js
│   │   ├── SearchHistory.js, UserCars.js
│   │   └── chat.js
│   ├── routes/                      # Express routers
│   ├── utils/                       # Seed scripts
│   ├── .env.example                 # Environment template
│   ├── server.js                    # Entry point
│   └── package.json
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
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/carrent
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=sk-...
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Run

**Backend** (terminal 1):
```bash
cd server
npm run dev
```

**Frontend** (terminal 2):
```bash
cd client
npm run dev
```

Backend: `http://localhost:5000` (health at `/health`)
Frontend: `http://localhost:5173`

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
- [ ] Unit & integration tests (Jest + Supertest)
- [ ] Full TypeScript migration
- [ ] Multi-language support

---

## 👤 Author

**Atef Ahabab**
GitHub: [@Atef123Ahabab](https://github.com/Atef123Ahabab)

---

## 📄 License

MIT — see [LICENSE](./LICENSE)