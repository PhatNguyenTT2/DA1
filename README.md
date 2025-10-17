## UIT Inventory & Purchasing System

### Overview
This repository contains a full‑stack inventory and purchasing management system:
- `admin/`: React (Vite + Tailwind CSS) admin UI
- `backend/`: Node.js + Express + MongoDB (Mongoose) API

The app manages Suppliers, Products, Purchase Orders, Inventory movements, Users/Roles, and Payments. It synchronizes key data across modules to keep stocks, debts, and payment states consistent.

### Prerequisites
- Node.js 18+ and npm
- A running MongoDB instance (local or cloud)

### Quick Start (Development)
#### 1) Backend (API)
```bash
cd backend
npm install

# Create backend/.env (see below), then run in dev mode
npm run dev
# API defaults to http://localhost:3001
```

Example `backend/.env`:
```bash
MONGODB_URI=mongodb://localhost:27017/uit_da2
PORT=3001
SECRET=replace-with-a-long-random-string
```

#### 2) Admin (Frontend)
```bash
cd admin
npm install

# Create admin/.env (see below), then run
npm run dev
# Vite dev server: http://localhost:5173
```

Example `admin/.env`:
```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

#### 3) Optional seed/setup scripts (Backend)
```bash
cd backend
node scripts/setup-roles.js
node scripts/seed-products.js
node scripts/seed-customers.js
# Explore REST examples in backend/requests/*.rest
```

### Core Features
- **Suppliers**: create/edit, activate/deactivate, hard delete (requires inactive); columns include Phone, Email, Address ("street, city"), Active, Total Purchase. Tracks `currentDebt` and `totalPurchaseAmount`.
- **Products & Inventory**: `product.stock` is source of truth. Inventory records quantity on hand and movement history. Stock‑in workflow tied to Purchase Orders.
- **Purchase Orders (PO)**:
  - Statuses (model‑level): `pending`, `approved`, `received`, `cancelled`
  - Created from Stock‑in flow with default `pending` (no immediate stock changes)
  - Approving and receiving trigger inventory updates and movement logs
  - Edit allowed only while `status === 'pending'`
  - Delete allowed only if `paymentStatus === 'paid'`
  - UI: sortable columns, status dropdown, edit modal
- **Payments**:
  - Auto‑create a `Payment` on PO creation (type `purchase`, status `pending`)
  - On completion: updates supplier `currentDebt` (down), `totalPurchaseAmount` (up), and PO `paidAmount`/`paymentStatus` (`unpaid` → `partial` → `paid`)
  - Correct related order number for purchase payments
- **Auth & Roles**: user/role setup (see `backend/scripts/setup-roles.js`), protected API routes and guarded admin pages.

### How It Works (High‑Level)
1) **Stock In → PO Creation**: From `StockInModal`, a Purchase Order is created with `status = 'pending'`. No stock change yet.
2) **Approve / Receive**:
   - Set PO to `approved` to allow receiving. Receiving items updates inventory and increases `product.stock`.
   - When all items are received, PO becomes `received`.
3) **Payments & Supplier Stats**:
   - PO creation auto‑generates a `Payment` (`pending`).
   - When payment is `completed`: supplier debt decreases, total purchase increases, and PO payment fields update.
4) **Supplier Activation/Deletion**:
   - Toggle Active/Inactive. Hard delete requires inactive and `?permanent=true`.

### Key UI Details
- **Supplier List**: Address as "street, city"; Active dropdown; delete disabled while active; widths aligned with Product List; sortable by `totalPurchaseAmount`.
- **Purchase Order List**: Columns include ID, Supplier, Items, Total, Paid, Date, Delivery, Status, Created By, Actions. Status restricted to `pending | approved | received | cancelled`. Delete guarded by `paymentStatus === 'paid'`.

### Configuration Notes
- Frontend API base URL comes from `admin/.env` `VITE_API_BASE_URL`.
- Backend reads environment from `backend/.env` (`MONGODB_URI`, `PORT`, `SECRET`).
- Use `product.stock` for current stock in UI/services.

### Common Commands
#### Backend
```bash
cd backend
npm run dev      # start in watch mode
npm start        # start once
```

#### Admin
```bash
cd admin
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview production build
```

### Troubleshooting
- **MongoDB connection issues**: verify `MONGODB_URI` and that MongoDB is running.
- **CORS/404 from admin**: ensure `VITE_API_BASE_URL` matches backend and includes `/api`.
- **Payment shows N/A order number**: backend must set `relatedOrderNumber = poNumber`; admin service reads populated fields.
- **Stock not updating**: PO must be `approved` and items received for stock/inventory changes.

### Project Structure (Top‑Level)
```
e:/UIT/da2/
  admin/           # React admin UI
  backend/         # Express API + Mongoose models
  README.md        # This file
```

### License
Internal/educational use. Add a license if you plan to distribute.
