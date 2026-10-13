# Admin Dashboard Bundle & Related Files

This folder contains a complete, standalone copy of the **Admin Dashboard** and all related components, backend API routes, authentication logic, database schema, and documentation for **Krono Watches (ICT2142 E-Business Systems - Week 08)**.

---

## Folder Structure

```text
admin_dashboard_files/
├── README.md                          # This index and overview
├── ui/                                # Admin frontend pages and layout
│   ├── page.tsx                       # Dashboard home: summary cards, recent orders, products
│   ├── layout.tsx                     # Admin layout: sidebar navigation and auth guards
│   ├── products/
│   │   ├── page.tsx                   # Products table: search, quick stock stepper, edit modal
│   │   └── new/
│   │       └── page.tsx               # Add new product form
│   ├── orders/
│   │   └── page.tsx                   # Orders table: search, status update workflow
│   └── promotions/
│       └── page.tsx                   # Storefront promotional banner management
├── api_routes/                        # Backend REST API routes
│   ├── products/
│   │   ├── route.ts                   # GET (list products) / POST (create product)
│   │   ├── [id]/route.ts              # GET / PUT (update) / DELETE (soft-delete)
│   │   └── stats/route.ts             # GET aggregate stats (total products, low stock, etc.)
│   └── orders/
│       ├── route.ts                   # GET (list orders) / POST (create order)
│       └── [id]/
│           ├── route.ts               # GET order details
│           └── status/route.ts        # PATCH order status (Pending -> Paid -> Shipped...)
├── backend_lib/                       # Database engine and security helpers
│   ├── db.ts                          # Database queries, stock reduction, price recalculation
│   ├── auth.ts                        # Server-side requireAdmin role check helper
│   ├── client_api.ts                  # Client-side API functions used by UI
│   ├── AuthContext.tsx                # Client-side authentication provider & user state
│   └── middleware.ts                  # Next.js Edge Middleware route guard for /admin
├── schema/
│   └── supabase_schema.sql            # PostgreSQL schema DDL (users, products, orders, order_items)
└── documentation/
    ├── ICT2142_Week08_Documentation_and_Lab_Diary.pdf  # Compiled 5-page PDF report
    └── ICT2142_Week08_Documentation_and_Lab_Diary.md   # Week 08 Lab Diary markdown source
```

---

## Dashboard Overview & Features

### 1. Dashboard Home (`ui/page.tsx`)
- **Summary Cards (Slide 9):**
  - **Products (128):** Total active catalog products in database.
  - **Orders (24):** Total customer orders and revenue.
  - **Low Stock (7):** Products with 5 or fewer items remaining.
  - **Database Status (Connected ✓):** Persistent database connection indicator.
- **Recent Orders Table:** Shows recent customer orders with quick status buttons (`Mark Paid`, `View`).
- **Products & Stock Table:** Fast view of inventory with quick `+` and `-` buttons to change stock.

### 2. Product Management (`ui/products/page.tsx` & `ui/products/new/page.tsx`)
- **Create:** Add new watches with name, brand, category, price (LKR), stock, and images.
- **Read & Search:** Search products by name, reference ID, and brand.
- **Update:** Inline `+` / `-` stock adjustments or open the edit modal to update details.
- **Delete / Deactivate:** Soft-delete (`is_active = false`) preserves order history while removing the watch from public store catalog.

### 3. Order Management (`ui/orders/page.tsx`)
- **Order Registry:** View customer name, email, items purchased, totals, and payment status.
- **Fulfillment Lifecycle:**
  $$\text{Pending} \longrightarrow \text{Paid} \longrightarrow \text{Processing} \longrightarrow \text{Shipped} \longrightarrow \text{Completed}$$
- Status updates immediately save to the database via `PATCH /api/orders/[id]/status`.

### 4. Security & Role-Based Access Control (`backend_lib/`)
- **`middleware.ts`:** Intercepts requests to `/admin`. Non-admin accounts are immediately redirected to `/`.
- **`layout.tsx`:** React client guard checking `useAuth()` to prevent unauthorized viewing of cached pages.
- **`auth.ts`:** Server helper `requireAdmin()` verifying JWT signatures on mutating API requests.
- **Test Accounts:**
  - **Admin:** `admin@krono.luxury` | Password: `Admin@1234` (Role: `admin`)
  - **Customer:** `customer@krono.luxury` | Password: `Customer@1234` (Role: `customer`)
