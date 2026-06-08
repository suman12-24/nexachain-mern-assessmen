# NexaChain AI — MERN Stack Investment & Referral Platform

---

## Project Overview

NexaChain AI is a full-stack investment and referral-based platform on the MERN Stack that enables users to:

- Create investments across **3 tiered plans** (Silver, Gold, Diamond)
- Earn **daily ROI** credited automatically every midnight via `node-cron`
- Build passive income through a **5-level referral hierarchy**
- Monitor all earnings on a **live React dashboard** with charts, stat cards, and history tables
- Share a **personalized referral link** that auto-fills the referral code on the register page

---

## Project Structure

```
nexachain/
├── backend/
│   ├── config/
│   │   └── cron.js                  # Task 5 — node-cron daily scheduler
│   ├── controllers/
│   │   ├── authController.js        # Task 2 — Register, Login, Me
│   │   ├── investmentController.js  # Task 2 — Create & list investments
│   │   └── dashboardController.js   # Task 2 — Dashboard, ROI, referral APIs
│   ├── middleware/
│   │   └── auth.js                  # JWT protect middleware
│   ├── models/
│   │   ├── User.js                  # Task 1 — User schema
│   │   ├── Investment.js            # Task 1 — Investment schema
│   │   ├── ReferralIncome.js        # Task 1 — Level income schema
│   │   └── ROIHistory.js            # Task 1 — Daily ROI history schema
│   ├── routes/
│   │   └── index.js                 # All API routes
│   ├── services/
│   │   ├── referralService.js       # Task 3 — Level income distribution
│   │   └── roiService.js            # Task 3 + 5 — Daily ROI + idempotency
│   ├── utils/
│   │   └── validators.js            # Indian mobile + strong password validation
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state + authFetch helper
│   │   ├── hooks/
│   │   │   └── useApi.js            # Generic authenticated data hook
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Sidebar + topbar shell
│   │   │   └── UI.jsx               # StatCard, Panel, DataTable, Pill, Button…
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx         # With password strength meter + mobile validation
│   │   │   ├── Dashboard.jsx        # Stat cards + charts + 3 history tables
│   │   │   ├── Invest.jsx           # Plan selector + live ROI preview
│   │   │   ├── Portfolio.jsx        # Investment history + filter tabs
│   │   │   ├── ROIHistory.jsx       # Bar chart + ROI credits + manual trigger
│   │   │   ├── Referrals.jsx        # Share link + referral tree + income log
│   │   │   └── Wallet.jsx           # Balance stats + transaction ledger
│   │   ├── utils/
│   │   │   ├── format.js            # Currency, date, colour utilities
│   │   │   └── validators.js        # Frontend mirrors of backend validators
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── NexaChain-Postman-Collection.json
└── README.md
```

---

## Project Setup Steps

### Prerequisites

- Node.js v18 or higher
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string
- npm v9+

### Step 1 — Clone / Extract

```bash
git clone <your-repo-url>
cd nexachain
```

### Step 2 — Backend Setup

```bash
cd backend

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET

# Install dependencies
npm install

# Start development server (hot reload with nodemon)
npm run dev

# Server starts on → http://localhost:5000
```

### Step 3 — Frontend Setup

```bash
cd ../frontend

# Copy environment file
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (default, no change needed for local)

# Install dependencies
npm install

# Start development server
npm run dev

# App starts on → http://localhost:3000
```

### Step 4 — Verify

Open http://localhost:3000 in your browser. You should see the NexaChain AI login page.

### Step 5 — Import Postman Collection

1. Open Postman
2. Click **Import** → select `NexaChain-Postman-Collection.json`
3. Register a user — the test script auto-saves the JWT as `token`
4. All subsequent requests use `{{token}}` automatically

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/nexachain` |
| `JWT_SECRET` | Secret key for signing JWTs — **change in production** | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | Token TTL | `7d` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:5000/api` |

---

## Database Schema

### 1. User Model (`backend/models/User.js`)

| Field | Type | Rules |
|---|---|---|
| `fullName` | String | Required, max 100 chars |
| `email` | String | Required, unique, lowercase |
| `mobile` | String | Required, unique, 10-digit Indian mobile (6–9 prefix) |
| `password` | String | Required, bcrypt hashed, `select: false` |
| `referralCode` | String | Auto-generated 8-char UUID-based, unique |
| `referredBy` | ObjectId → User | Parent user reference, null for root |
| `walletBalance` | Number | Default 0, min 0 |
| `totalRoiEarned` | Number | Lifetime ROI credits |
| `totalLevelIncomeEarned` | Number | Lifetime referral income |
| `accountStatus` | Enum | `active` / `inactive` / `suspended` |

**Indexes:** `email`, `mobile`, `referralCode`, `referredBy`

---

### 2. Investment Model (`backend/models/Investment.js`)

| Field | Type | Rules |
|---|---|---|
| `user` | ObjectId → User | Required |
| `amount` | Number | Required, min 1 |
| `planDetails` | Object | name, durationDays, min/maxAmount |
| `dailyRoiPercentage` | Number | 0–100 |
| `startDate` | Date | Defaults to now |
| `endDate` | Date | Set by controller: startDate + durationDays |
| `totalRoiPaid` | Number | Cumulative ROI credited so far |
| `status` | Enum | `active` / `completed` / `cancelled` |

**Indexes:** `(user, status)`, `(status, endDate)`

---

### 3. ReferralIncome Model (`backend/models/ReferralIncome.js`)

| Field | Type | Description |
|---|---|---|
| `recipient` | ObjectId → User | Who RECEIVES the income |
| `generator` | ObjectId → User | Whose investment TRIGGERED it |
| `investment` | ObjectId → Investment | The triggering investment |
| `level` | Number | 1 = direct, 2 = grandparent, … 5 |
| `amount` | Number | Income credited |
| `date` | Date | Timestamp |

**De-dup Index:** `(investment, recipient, level)` — prevents double-crediting

---

### 4. ROIHistory Model (`backend/models/ROIHistory.js`)

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId → User | Owner |
| `investment` | ObjectId → Investment | Source investment |
| `amount` | Number | ROI amount credited |
| `date` | Date | Normalised to midnight UTC |
| `status` | Enum | `credited` / `pending` / `failed` |

**Unique Index:** `(investment, date)` — primary idempotency guard for cron

---

## API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth Header:** `Authorization: Bearer <token>`

---

### Authentication

#### POST `/auth/register`

**Body:**
```json
{
  "fullName": "Rahul Kumar",
  "email": "rahul@example.com",
  "mobile": "9876543210",
  "password": "Secure@123",
  "referralCode": "AB12CD34"
}
```

**Validation:**
- Mobile: 10-digit Indian number starting with 6, 7, 8, or 9
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character

**Response `201`:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "fullName": "Rahul Kumar", "referralCode": "AB12CD34" }
}
```

---

#### POST `/auth/login`

**Body:** `{ "email": "...", "password": "..." }`  
**Response `200`:** JWT token + user profile

---

#### GET `/auth/me` 🔒

Returns current authenticated user.

---

### Investments

#### GET `/investments/plans`

Returns all 3 available plans (public):

| Plan | Daily ROI | Duration | Min | Max |
|---|---|---|---|---|
| silver | 1.0% | 30 days | ₹100 | ₹9,999 |
| gold | 1.5% | 60 days | ₹10,000 | ₹49,999 |
| diamond | 2.0% | 90 days | ₹50,000 | Unlimited |

---

#### POST `/investments` 🔒

**Body:** `{ "planKey": "silver", "amount": 500 }`

On success: creates investment, distributes referral income up to 5 levels.

---

#### GET `/investments` 🔒

Query params: `?status=active|completed|cancelled&page=1&limit=10`

---

### Dashboard

#### GET `/dashboard` 🔒

Returns: `walletBalance`, `totalRoiEarned`, `totalLevelIncomeEarned`, investment counts, recent ROI, recent referral income.

#### GET `/roi-history` 🔒

Query: `?page=1&limit=30` — Paginated daily ROI credits with plan details.

#### POST `/debug/trigger-roi` 🔒 *(dev only)*

Manually runs the ROI cron job. Safe to call multiple times — already-credited days are skipped.

---

### Referrals

#### GET `/referrals/direct` 🔒

Direct (Level 1) referrals with their profile and status.

#### GET `/referrals/tree` 🔒

Full BFS referral tree up to 5 levels deep.

**Response structure:**
```json
{
  "tree": {
    "userId": "...", "fullName": "You", "level": 0,
    "children": [
      { "userId": "...", "fullName": "erewr", "level": 1, "children": [...] }
    ]
  }
}
```

#### GET `/referrals/income` 🔒

Paginated referral income log. Query: `?page=1&limit=20`

---

### Health

#### GET `/health` (public)

```json
{ "status": "ok", "uptime": 3600 }
```

---

## Business Logic

### Level Income Distribution (`services/referralService.js`)

Triggered on every new investment. Walks up the referral chain and credits each ancestor:

| Level | Who | % of Investment |
|---|---|---|
| L1 | Direct referrer | 5% |
| L2 | Referrer's referrer | 3% |
| L3 | 3rd ancestor | 2% |
| L4 | 4th ancestor | 1% |
| L5 | 5th ancestor | 0.5% |

**Idempotency:** `findOne` check before each insert prevents duplicate credits if called twice for the same investment.

### Daily ROI Service (`services/roiService.js`)

For each active investment:
1. Check if ROI already credited today (midnight UTC date match)
2. If not: compute `amount = principal × dailyRoiPercentage / 100`
3. Insert `ROIHistory` record
4. Increment `user.walletBalance` and `user.totalRoiEarned`
5. Increment `investment.totalRoiPaid`
6. Mark investment `completed` if `endDate` reached

**Double-credit protection:** Unique index `(investment, date)` — any duplicate insert throws `E11000` which is caught and counted as a safe skip.

---

## Cron Job Implementation

**File:** `backend/config/cron.js`

```js
cron.schedule('0 0 * * *', async () => {
  await processROIForAllActiveInvestments();
}, { timezone: 'UTC' });
```

- Runs every day at **00:00 UTC (midnight)**
- Processes all `status: active` investments
- **Idempotent** — safe even if triggered twice accidentally
- Works with **standalone MongoDB** (no replica set required)

---

## React Dashboard

### Pages

| Route | Description |
|---|---|
| `/login` | Login with email + password, show/hide toggle |
| `/register` | Registration with Indian mobile validation, password strength meter, referral code auto-fill from URL |
| `/dashboard` | Stat cards, earnings line chart, portfolio pie chart, **Investment History table**, **ROI History table**, **Referral Income History table** |
| `/invest` | Plan selector with live ROI preview calculator |
| `/portfolio` | Full investment list with status filter tabs |
| `/roi-history` | Bar chart + credits table + manual trigger button |
| `/referrals` | Share link (copy/native share), collapsible tree, income log |
| `/wallet` | Balance summary + transaction ledger |

### Validation (Register page)

**Indian Mobile:**
- Accepts: `9876543210`, `+919876543210`, `919876543210`, `09876543210`
- Rejects: numbers not starting with 6–9, short numbers, non-Indian formats

**Strong Password (all 5 rules must pass):**
- Minimum 8 characters
- At least one uppercase letter (A–Z)
- At least one lowercase letter (a–z)
- At least one digit (0–9)
- At least one special character (`!@#$%^&*…`)

---

## Postman Collection

**File:** `NexaChain-Postman-Collection.json`

**How to use:**
1. Import into Postman
2. Run **Register** or **Login** — the test script automatically saves the JWT to `{{token}}`
3. All protected routes use `{{token}}` from the collection variable

**Folders:**
- Auth (Register, Login, Me)
- Investments (Plans, Create, List)
- Dashboard (Stats, ROI History, Trigger ROI)
- Referrals (Direct, Tree, Income History)
- Health

---

