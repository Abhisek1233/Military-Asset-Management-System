# 🛡️ Military Asset Management Command System

An enterprise-grade, full-stack **Military Asset Management System** built with **React**, **Tailwind CSS v4**, **Vite**, **Node.js/Express**, and **Neon Cloud PostgreSQL**. 

This system enforces real-time stock auditability, ACID-compliant cross-base equipment transfers, strict Role-Based Access Control (RBAC), and interactive metric decomposition.

---

## 📐 Master Dynamic Inventory Formulas

The system calculates inventory metrics dynamically in PostgreSQL using SQL Common Table Expressions (CTEs), guaranteeing zero static data fallback:

$$\text{Closing Balance} = \text{Opening Balance} + \text{Net Movement} - \text{Assigned Personnel} - \text{Expended Stock}$$

$$\text{Net Movement} = \text{Purchases} + \text{Transfers In} - \text{Transfers Out}$$

### Verified Live Stock Totals (Neon Cloud PostgreSQL)

| View Scope | Opening Balance | Purchases | Transfers In | Transfers Out | Net Movement | Assigned | Expended | Calculated Closing |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Global / Admin** | **1,384** | **235** | **17** | **17** | **+235** | **50** | **80** | **1,489** |
| **Fort Alpha (Base #1)** | **668** | **230** | **0** | **15** | **+215** | **50** | **80** | **753** |

---

## 🔥 Key Technical & Architectural Features

1. **ACID-Compliant Atomic Cross-Base Transfers**:
   - Uses PostgreSQL `BEGIN...COMMIT` transaction blocks via Node `pg` pool to execute simultaneous stock deduction at the origin base and stock credit at the destination base.
   - Retains full control over transaction isolation levels, preventing duplicate stock creation or loss mid-transfer.

2. **Role-Based Access Control (RBAC) & Base Scoping**:
   - **`ADMIN` / `LOGISTICS_OFFICER`**: Unrestricted global visibility across all military bases and audit trails.
   - **`BASE_COMMANDER`**: Data access is strictly scoped to their assigned base (e.g. Fort Alpha). Attempts to view or mutate assets outside their base scope return `403 Forbidden`.

3. **Central System Audit Trail**:
   - Every mutation (Purchases, Transfers, Personnel Assignments, Consumed Expenditures) is recorded in an immutable `audit_logs` database table.

4. **Modern Design System & Micro-Interactions**:
   - **Theme Engine**: Dark mode default (`#0F172A` page, `#1E293B` cards, `#273449` hover state) with a clean Light mode variant (`#F8FAFC` page, `#FFFFFF` cards).
   - **Card Accent System**: 3px left border accent styling (`border-l-[3px]`) on metric cards.
   - **Sticky Non-Bleeding Navbar**: Solid background header (`z-40`) preventing content text mixing during scroll.
   - **Full Width Edge-to-Edge**: Navbar logo anchored to far left corner, user controls to far right corner.
   - **Animated Skeleton Loaders**: Shimmering `StatCardSkeleton`, `TableSkeleton`, and `ChartSkeleton` rendered during data fetching.
   - **Button Spinners & Eye Toggle**: Inline SVG spinners (`<Spinner />`) during form submission and Eye/EyeOff password visibility toggle on Login screen.
   - **Interactive Metric Detail Popups**: All 5 metric cards (**Opening**, **Net Movement**, **Assigned**, **Expended**, **Closing**) open interactive audit breakdown modals.

---

## 📁 Project Directory Structure

```text
military-asset-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL Pool Connection (Neon Cloud TLS)
│   ├── middleware/
│   │   ├── auth.js               # JWT Token Authentication Middleware
│   │   └── rbac.js               # Role Authorization & Base Scoping Middleware
│   ├── routes/
│   │   ├── assetRoutes.js        # Dashboard Metrics & Base Filters
│   │   ├── purchaseRoutes.js     # Equipment Procurement Logging
│   │   ├── transferRoutes.js     # Atomic Cross-Base Transfer Operations
│   │   ├── assignmentRoutes.js   # Personnel Allocations & Expenditures
│   │   └── auditRoutes.js        # Central System Audit Logs
│   ├── services/
│   │   ├── assetService.js       # SQL CTE Metric Calculation Logic
│   │   └── transferService.js    # PostgreSQL BEGIN...COMMIT Transaction Engine
│   ├── scripts/
│   │   ├── schema.sql            # PostgreSQL DDL Database Schema
│   │   └── seed.js              # Database Seeder Script
│   ├── .env                      # Environment Variables
│   ├── package.json              # Backend Dependencies (Nodemon included)
│   └── server.js                 # Express API Server Entry Point
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Logo.jsx          # Official Military Command Crest Emblem
    │   │   ├── MetricDetailModals.jsx # Dynamic Audit Popups for Metric Cards
    │   │   ├── Navbar.jsx        # Sticky Header (Full-width edge-to-edge)
    │   │   ├── Sidebar.jsx       # Navigation Menu & Mobile Drawer
    │   │   ├── Skeleton.jsx      # Shimmering Loaders & Button Spinners
    │   │   ├── StatCard.jsx      # 3px Left Accent Metric Card
    │   │   └── StatusBadge.jsx   # Status Pill Badges
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Auth State & Token Persistence
    │   │   └── ThemeContext.jsx  # Dark/Light Mode Theme Provider
    │   ├── pages/
    │   │   ├── Dashboard.jsx     # Master Asset Command Center & Recharts
    │   │   ├── Purchases.jsx     # Equipment Procurement Form & Log
    │   │   ├── Transfers.jsx     # Atomic Cross-Base Transfer Engine
    │   │   ├── Assignments.jsx   # Personnel Allocations & Consumed Inventory
    │   │   ├── AuditLogs.jsx     # Immutable Security Audit Trail
    │   │   └── Login.jsx         # Military Security Sign In & Demo Switcher
    │   ├── index.css             # Tailwind v4 Directives & Typography Tokens
    │   └── App.jsx               # React Router & Protected Routes Layout
    ├── public/
    │   └── military_logo.jpg     # Generated High-Res Military Logo Emblem
    ├── index.html                # Google Fonts (Plus Jakarta Sans & Inter)
    └── package.json              # Frontend Dependencies
```

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+ or v20+ or v22+)
- npm or yarn

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# (Optional) Seed live PostgreSQL Database
npm run seed

# Start API Server with Nodemon Auto-Reloading
npm run dev
```
Backend API Server runs at **`http://localhost:5000`** (Health Check: `http://localhost:5000/api/health`).

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite React Frontend
npm run dev
```
Frontend Web App runs at **`http://localhost:5174`** or **`http://localhost:5173`**.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Username | Password | Clearance Scope |
| :--- | :--- | :--- | :--- |
| **Global Admin** | `admin_user` | `AdminPass123!` | All Military Bases |
| **Base Commander** | `commander_alpha` | `CommandPass123!` | Fort Alpha (Base #1 Scoped) |
| **Logistics Officer** | `logistics_officer` | `LogisticsPass123!` | Global Operations |

---

## 📜 Compliance & Verification Checklist

- [x] **PostgreSQL Database**: Connected live to Neon Cloud PostgreSQL.
- [x] **Raw SQL & Node `pg`**: Used raw SQL for explicit `BEGIN...COMMIT` transfer blocks.
- [x] **Dynamic Metric CTEs**: Zero hardcoded data; computed directly from relational tables.
- [x] **RBAC Scoping**: Verified via test suite (`scratch/test_rbac.js`).
- [x] **Tailwind CSS v4 & Theme System**: Dark mode default (`#0F172A`) with light mode toggle.
- [x] **Full Edge-to-Edge Layout**: Navbar & main content expand to screen boundaries.
- [x] **Loading UI**: Shimmering Skeleton Loaders & inline SVG spinners.
- [x] **Interactive Audit Popups**: All 5 metric cards open detailed decomposition modals.
