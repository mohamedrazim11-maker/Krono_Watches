const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = 'c:/Users/Razim/Desktop/EcomProject/ICT2142_Week08_Documentation_and_Lab_Diary.pdf';
const artifactDir = 'C:/Users/Razim/.gemini/antigravity-ide/brain/02b981e9-043b-4b17-835e-bed0b77268a4';
const artifactPath = path.join(artifactDir, 'ICT2142_Week08_Documentation_and_Lab_Diary.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 24, bottom: 25, left: 36, right: 36 },
  bufferPages: true,
  autoFirstPage: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// ─── Color Palette ──────────────────────────────────────────────────────────
const C = {
  primaryDark: '#0B132B',
  secondaryDark: '#1C2541',
  accentBlue: '#0284C7',
  accentBlueLight: '#F0F9FF',
  accentTeal: '#0D9488',
  tealLight: '#F0FDFA',
  gold: '#B45309',
  goldLight: '#FEF3C7',
  emerald: '#059669',
  emeraldLight: '#ECFDF5',
  rose: '#E11D48',
  roseLight: '#FFF1F2',
  textMain: '#1E293B',
  textSub: '#475569',
  textMuted: '#64748B',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  codeBg: '#F8FAFC',
  codeBorder: '#CBD5E1',
};

// ─── Helper Functions ───────────────────────────────────────────────────────
function drawPageHeader(title, subtitle) {
  const y = 24;
  doc.rect(36, y, 523, 38).fill(C.primaryDark);

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#FFFFFF')
    .text(title, 46, y + 6, { width: 503, lineBreak: false });

  doc.font('Helvetica').fontSize(7.5).fillColor('#94A3B8')
    .text(subtitle, 46, y + 22, { width: 503, lineBreak: false });

  doc.y = y + 43;
}

function drawSectionHeading(num, title) {
  doc.moveDown(0.2);
  const y = doc.y;
  doc.rect(36, y, 4, 12).fill(C.accentBlue);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.primaryDark)
    .text(`${num}. ${title}`, 45, y + 1, { lineBreak: false });
  doc.y = y + 15;
}

function drawSubHeading(title) {
  doc.moveDown(0.12);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#0369A1')
    .text(title, 36, doc.y);
  doc.moveDown(0.08);
}

function drawParagraph(text) {
  doc.font('Helvetica').fontSize(7).fillColor(C.textMain).lineGap(1.1)
    .text(text, 36, doc.y, { width: 523, align: 'justify' });
  doc.moveDown(0.12);
}

function drawCallout(title, text, borderColor = C.accentBlue, bgColor = C.accentBlueLight) {
  const startY = doc.y;
  doc.font('Helvetica').fontSize(6.8).lineGap(1.1);
  const textHeight = doc.heightOfString(text, { width: 507 });
  const boxHeight = textHeight + 20;

  doc.rect(36, startY, 523, boxHeight).fillAndStroke(bgColor, borderColor);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.primaryDark)
    .text(title, 44, startY + 5, { lineBreak: false });
  doc.font('Helvetica').fontSize(6.8).fillColor(C.textSub)
    .text(text, 44, startY + 16, { width: 507, lineGap: 1.1 });

  doc.y = startY + boxHeight + 4;
}

function drawCodeBox(codeString, customLineHeight = 8.2) {
  const lines = codeString.split('\n');
  const boxHeight = lines.length * customLineHeight + 7;
  const startY = doc.y;
  doc.rect(36, startY, 523, boxHeight).fillAndStroke(C.codeBg, C.codeBorder);

  let curY = startY + 4;
  for (const line of lines) {
    doc.font('Courier').fontSize(6.3).fillColor(C.primaryDark)
      .text(line, 42, curY, { lineBreak: false });
    curY += customLineHeight;
  }
  doc.y = startY + boxHeight + 4;
}

function drawMetricCard(x, y, w, h, title, value, statusText, color = C.accentBlue) {
  doc.rect(x, y, w, h).fillAndStroke('#FFFFFF', C.borderLight);
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(C.textMuted)
    .text(title, x + 8, y + 5, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.primaryDark)
    .text(value, x + 8, y + 16, { lineBreak: false });
  if (statusText) {
    doc.font('Helvetica-Bold').fontSize(6.2).fillColor(color)
      .text(statusText, x + 8, y + 33, { lineBreak: false });
  }
}

function drawFlowStep(x, y, w, h, title, desc, tag = '', isAccent = false) {
  doc.rect(x, y, w, h).fillAndStroke(isAccent ? '#F0F9FF' : '#FFFFFF', isAccent ? C.accentBlue : C.border);
  if (tag) {
    const tagW = Math.max(44, doc.widthOfString(tag) + 8);
    doc.rect(x + w - tagW - 4, y + 3, tagW, 9).fill(isAccent ? C.accentBlue : '#E2E8F0');
    doc.font('Helvetica-Bold').fontSize(5.2).fillColor(isAccent ? '#FFFFFF' : C.textSub)
      .text(tag, x + w - tagW - 4, y + 4.5, { width: tagW, align: 'center', lineBreak: false });
  }
  doc.font('Helvetica-Bold').fontSize(6.8).fillColor(C.primaryDark)
    .text(title, x + 5, y + 4, { lineBreak: false });
  doc.font('Helvetica').fontSize(6).fillColor(C.textSub)
    .text(desc, x + 5, y + 13, { width: w - 10, lineGap: 0.8 });
}

function drawArrowRight(xFrom, y, xTo) {
  doc.strokeColor(C.accentBlue).lineWidth(1)
    .moveTo(xFrom, y).lineTo(xTo, y).stroke();
  doc.fillColor(C.accentBlue)
    .polygon([xTo, y], [xTo - 4, y - 2.5], [xTo - 4, y + 2.5]).fill();
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 1: TITLE, PROJECT OVERVIEW & ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════
drawPageHeader(
  'ICT2142 E-Business Systems — Student Lab Report & Project Diary',
  'Week 08: Database Integration & Admin Dashboard (Phase 3 Testing & Deployment)'
);

// Metadata Block
const mY = doc.y;
doc.rect(36, mY, 523, 46).fillAndStroke('#F8FAFC', C.borderLight);
doc.font('Helvetica-Bold').fontSize(6.8).fillColor(C.primaryDark).text('Course Module:', 44, mY + 5, { lineBreak: false });
doc.font('Helvetica').fontSize(6.8).fillColor(C.textSub).text('ICT2142 E-Business Systems • Phase 3 Testing & Deployment (Weeks 8–10)', 118, mY + 5, { lineBreak: false });

doc.font('Helvetica-Bold').fontSize(6.8).fillColor(C.primaryDark).text('Project Name:', 44, mY + 15, { lineBreak: false });
doc.font('Helvetica').fontSize(6.8).fillColor(C.textSub).text('Krono Watches E-Commerce Web Application (Currencies: Sri Lankan Rupee - LKR)', 118, mY + 15, { lineBreak: false });

doc.font('Helvetica-Bold').fontSize(6.8).fillColor(C.primaryDark).text('Tech Stack:', 44, mY + 25, { lineBreak: false });
doc.font('Helvetica').fontSize(6.8).fillColor(C.textSub).text('Next.js 16 (App Router), TypeScript, React, Supabase (PostgreSQL), Local Persistent DB, TailwindCSS', 118, mY + 25, { lineBreak: false });

doc.font('Helvetica-Bold').fontSize(6.8).fillColor(C.primaryDark).text('GitHub Repo:', 44, mY + 35, { lineBreak: false });
doc.font('Helvetica').fontSize(6.8).fillColor(C.accentBlue).text('https://github.com/mohamedrazim11-maker/Krono_Watches.git (Branch: main)', 118, mY + 35, { lineBreak: false });

doc.y = mY + 50;

drawSectionHeading('1', 'Project Progress & Lab Objectives (Slides 2 & 3)');
drawParagraph(
  'In Week 08, we connect our store to a real database so that all product information, customer orders, and stock levels are saved permanently. Previously, data was stored in temporary lists that reset on page reload. Now, the database is the single source of truth for the entire application.'
);

// Timeline Boxes (Slide 2)
const tY = doc.y + 1;
const boxW = 98;
const boxH = 32;
drawFlowStep(36, tY, boxW, boxH, 'Weeks 1–2', 'Scope, wireframes,\nsite architecture', 'DONE', false);
drawFlowStep(142, tY, boxW, boxH, 'Weeks 3–5', 'UI, catalog, cart,\nresponsive layouts', 'DONE', false);
drawFlowStep(248, tY, boxW, boxH, 'Weeks 6–7', 'User login, checkout\n& payment setup', 'DONE', false);
drawFlowStep(354, tY, boxW, boxH, 'Week 8 (Current)', 'Database integration &\nAdmin Dashboard', 'ACTIVE', true);
drawFlowStep(460, tY, 99, boxH, 'Weeks 9–10', 'Testing, bug fixing\n& final presentation', 'NEXT', false);
doc.y = tY + boxH + 5;

// Target Architecture
drawSubHeading('1.1 Target Architecture & Source of Truth Rule (Slide 4)');
drawCallout(
  'Main Rule for Week 08',
  '"The database becomes the single source of truth. Frontend pages can display data, but all permanent changes (adding products, saving orders, changing stock) must be saved through the backend into the database."',
  C.accentBlue,
  C.accentBlueLight
);

const archY = doc.y;
drawFlowStep(36, archY, 120, 30, '1. Storefront UI', 'Catalog • Cart • Profile\nCheckout pages', 'CUSTOMER', false);
drawArrowRight(158, archY + 15, 170);
drawFlowStep(172, archY, 120, 30, '2. Backend API', 'Validates inputs,\nchecks passwords & roles', 'API ROUTES', true);
drawArrowRight(294, archY + 15, 306);
drawFlowStep(308, archY, 115, 30, '3. Database', 'Users • Products\nOrders • Order Items', 'DATABASE', false);
drawArrowRight(425, archY + 15, 437);
drawFlowStep(439, archY, 120, 30, '4. Admin Dashboard', 'Manage products, orders\nand stock levels', 'ADMIN', true);
doc.y = archY + 35;

drawSubHeading('1.2 Week 08 Deliverables Checklist (Slides 3 & 14)');
drawCodeBox(
  '[x] Milestone 1 - Database Schema: Created USERS, PRODUCTS, ORDERS, and ORDER_ITEMS tables.\n' +
  '[x] Milestone 2 - Connect Products to Database: Product catalog loads live from the database.\n' +
  '[x] Milestone 3 - Persist Orders at Checkout: Cart items save as orders, total recalculated on server, stock decreased.\n' +
  '[x] Milestone 4 - Protect the Admin Area: Only logged-in users with role "admin" can access /admin routes.\n' +
  '[x] Milestone 5 - Build Admin Dashboard: Summary cards (Products, Orders, Low Stock), Product CRUD, and Order status flow.\n' +
  '[x] Documentation & Lab Diary: Schema details, API list, security notes, and two real debugging problems solved.'
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 2: MILESTONE 1 — DATABASE SCHEMA
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
drawPageHeader(
  'ICT2142 E-Business Systems — Student Lab Report & Project Diary',
  'Practical Milestone 1: Finalize the Database Schema (Slide 5)'
);

drawSectionHeading('2', 'Practical Milestone 1 — Database Schema & Tables');
drawParagraph(
  'We designed a clean relational database schema with four primary tables. Each table has a unique primary key, and relationships are linked using foreign keys.'
);

drawSubHeading('2.1 Required Table Relationships');
drawCallout(
  'How Tables Connect (Slide 5 Requirements)',
  '1. One user can place many orders (1 : M): An order links to the user who bought it.\n' +
  '2. One order contains many order items (1 : M): An order can contain multiple items.\n' +
  '3. Each order item points to one product (M : 1): Each item links to a specific product in the database.\n' +
  '4. Product stock decreases after order is confirmed: Stock drops only when an order is successfully completed.',
  C.accentTeal,
  C.tealLight
);

drawSubHeading('2.2 Entity-Relationship Diagram (ERD)');
drawCodeBox(
  '+----------------------------------+                   +----------------------------------+\n' +
  '|              USERS               | 1               M |              ORDERS              |\n' +
  '+----------------------------------+-------------------+----------------------------------+\n' +
  '| PK  id               TEXT        |                   | PK  id               TEXT        |\n' +
  '|     full_name        TEXT        |                   | FK  user_id          TEXT        |\n' +
  '| UK  email            TEXT        |                   |     customer_name    TEXT        |\n' +
  '|     password_hash    TEXT        |                   |     customer_email   TEXT        |\n' +
  '|     role             TEXT        |                   |     total_amount     NUMERIC     |\n' +
  '|     created_at       TIMESTAMPTZ |                   |     status           TEXT        |\n' +
  '+----------------------------------+                   |     created_at       TIMESTAMPTZ |\n' +
  '                                                       +----------------------------------+\n' +
  '                                                                        | 1\n' +
  '                                                                        | contains\n' +
  '                                                                        | M\n' +
  '+----------------------------------+                   +----------------------------------+\n' +
  '|             PRODUCTS             | 1               M |           ORDER_ITEMS            |\n' +
  '+----------------------------------+-------------------+----------------------------------+\n' +
  '| PK  id               TEXT        |                   | PK  id               TEXT        |\n' +
  '|     name             TEXT        |                   | FK  order_id         TEXT        |\n' +
  '|     brand            TEXT        |-------------------| FK  product_id       TEXT        |\n' +
  '|     price (LKR)      NUMERIC     |                   |     quantity         INTEGER     |\n' +
  '|     stock_qty        INTEGER     |                   |     unit_price (LKR) NUMERIC     |\n' +
  '|     image_url        TEXT        |                   |     created_at       TIMESTAMPTZ |\n' +
  '|     is_active        BOOLEAN     |                   +----------------------------------+\n' +
  '+----------------------------------+'
);

drawSubHeading('2.3 Table Structure (SQL DDL)');
drawCodeBox(
  '-- 1. USERS: Stores customer and admin accounts\n' +
  'CREATE TABLE users (\n' +
  '    id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,\n' +
  '    password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT \'customer\', phone TEXT, address TEXT,\n' +
  '    status TEXT DEFAULT \'Active Member\', created_at TIMESTAMPTZ DEFAULT NOW()\n' +
  ');\n\n' +
  '-- 2. PRODUCTS: Stores watch catalog and stock numbers\n' +
  'CREATE TABLE products (\n' +
  '    id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT NOT NULL, category TEXT NOT NULL,\n' +
  '    price NUMERIC NOT NULL CHECK (price >= 0), stock_qty INTEGER NOT NULL DEFAULT 12,\n' +
  '    stock_count INTEGER DEFAULT 12, is_active BOOLEAN DEFAULT TRUE, is_featured BOOLEAN DEFAULT FALSE,\n' +
  '    image_url TEXT NOT NULL, images TEXT[], movement TEXT, case_material TEXT, water_resistance TEXT\n' +
  ');\n\n' +
  '-- 3. ORDERS: Stores orders and delivery information\n' +
  'CREATE TABLE orders (\n' +
  '    id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE SET NULL,\n' +
  '    customer_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_phone TEXT,\n' +
  '    delivery_address TEXT NOT NULL, total_amount NUMERIC NOT NULL, subtotal NUMERIC NOT NULL,\n' +
  '    discount_amount NUMERIC DEFAULT 0, status TEXT DEFAULT \'Pending\', payment_method TEXT DEFAULT \'payhere\',\n' +
  '    payment_status TEXT DEFAULT \'pending\', created_at TIMESTAMPTZ DEFAULT NOW()\n' +
  ');\n\n' +
  '-- 4. ORDER_ITEMS: Stores individual products inside each order\n' +
  'CREATE TABLE order_items (\n' +
  '    id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,\n' +
  '    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,\n' +
  '    quantity INTEGER NOT NULL DEFAULT 1, unit_price NUMERIC NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()\n' +
  ');'
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 3: MILESTONES 2 & 3 — CATALOG & ORDER PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
drawPageHeader(
  'ICT2142 E-Business Systems — Student Lab Report & Project Diary',
  'Practical Milestones 2 & 3: Product Data & Checkout Persistence (Slides 6 & 7)'
);

drawSectionHeading('3', 'Practical Milestone 2 — Connect Product Data to Database');
drawParagraph(
  'We removed all hard-coded product arrays from the frontend code. Products now load live from the database using our Next.js API endpoints.'
);

drawCallout(
  'Milestone 2 Steps Completed',
  '• Products Inserted: Added all catalog products into the database with price, stock, brand, and images.\n' +
  '• GET /api/products: Reads active products from the database with category and search filters.\n' +
  '• GET /api/products/[id]: Reads details for the selected product.\n' +
  '• Test Checkpoint: Refreshing the catalog page (/catalog) still loads all products correctly from the database.',
  C.accentBlue,
  C.accentBlueLight
);

drawSectionHeading('4', 'Practical Milestone 3 — Save Checkout as an Order');
drawParagraph(
  'When a customer checks out, the backend follows 5 simple steps to save the order and update inventory safely.'
);

// 5-Step Order Flow Diagram (Slide 7)
const sY = doc.y;
const stepW = 98;
const stepH = 44;
drawFlowStep(36, sY, stepW, stepH, '1. Validate Cart', 'Check product IDs,\nprices, and available\nstock in database.', 'STEP 1', false);
drawFlowStep(142, sY, stepW, stepH, '2. Create Order', 'Save user_id, verified\ntotal, status, and\ntimestamp in ORDERS.', 'STEP 2', true);
drawFlowStep(248, sY, stepW, stepH, '3. Create Items', 'Save each item into\nORDER_ITEMS table\nlinked to order ID.', 'STEP 3', false);
drawFlowStep(354, sY, stepW, stepH, '4. Update Stock', 'Decrease product stock\n(stock_qty) in database\nfor purchased items.', 'STEP 4', true);
drawFlowStep(460, sY, 99, stepH, '5. Return Result', 'Show order ID\n(e.g. KR-1031) and\norder confirmation.', 'STEP 5', false);
doc.y = sY + stepH + 6;

drawSubHeading('4.1 Server-Side Price Recalculation (Slide 7)');
drawCallout(
  'Important Security Rule',
  '"Do not trust totals sent by the browser. Recalculate order totals on the server using product data from the database."',
  C.rose,
  C.roseLight
);

drawParagraph(
  'If a user modifies the price in browser JavaScript before sending the checkout request, our server ignores the incoming price. The server looks up the real price in the database and recalculates the true total:'
);

drawCodeBox(
  '// Server order validation logic (lib/server/db.ts)\n' +
  'let trueSubtotal = 0;\n' +
  'const verifiedItems = [];\n\n' +
  'for (const item of cartItems) {\n' +
  '  const dbProduct = await getProductById(item.product_id);\n' +
  '  if (!dbProduct || !dbProduct.is_active) throw new Error("Product unavailable");\n' +
  '  if (dbProduct.stock_qty < item.quantity) throw new Error("Not enough stock available");\n\n' +
  '  // Use authoritative database price, NOT browser price\n' +
  '  const unitPrice = Number(dbProduct.price);\n' +
  '  trueSubtotal += unitPrice * item.quantity;\n\n' +
  '  // Reduce stock quantity\n' +
  '  dbProduct.stock_qty = Math.max(0, dbProduct.stock_qty - item.quantity);\n' +
  '  verifiedItems.push({ product_id: dbProduct.id, quantity: item.quantity, unit_price: unitPrice });\n' +
  '}\n' +
  'const grandTotal = Math.max(0, trueSubtotal - discount);'
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 4: SIMPLE ADMIN DASHBOARD STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
drawPageHeader(
  'ICT2142 E-Business Systems — Student Lab Report & Project Diary',
  'Practical Milestones 4 & 5: Simple Admin Dashboard & Protection (Slides 8–11)'
);

drawSectionHeading('5', 'Practical Milestone 4 — Protect the Admin Area (Slide 8)');
drawParagraph(
  'The admin area must be protected so normal customers cannot view or modify store data. We check the user role on the server before granting access.'
);

// Admin Access Flow Diagram (Slide 8)
const aY = doc.y + 1;
drawFlowStep(36, aY, 150, 34, '1. User Visits /admin', 'Next.js middleware\nintercepts the request', 'START', false);
drawArrowRight(190, aY + 17, 204);
drawFlowStep(206, aY, 155, 34, '2. Check Role', 'Read user login token;\nIs role == "admin"?', 'CHECK', true);
drawArrowRight(365, aY + 17, 379);
drawFlowStep(381, aY, 178, 34, '3. Allow or Redirect', 'Admin: Open Dashboard\nCustomer: Redirect to / (Deny)', 'RESULT', false);
doc.y = aY + 39;

drawSubHeading('5.1 Protection Layers & Test Accounts');
drawCodeBox(
  'Layer 1 (Middleware): frontend/middleware.ts checks token on every /admin route and blocks non-admins.\n' +
  'Layer 2 (Page Guard):  frontend/app/admin/layout.tsx checks client state to prevent cached views.\n' +
  'Layer 3 (API Guard):   frontend/lib/server/auth.ts requireAdmin() blocks non-admin API requests (401/403).\n\n' +
  'Test Logins: [Admin] admin@krono.luxury (Admin@1234, role: admin) | [Customer] customer@krono.luxury (Customer@1234, role: customer)'
);

drawSectionHeading('6', 'Practical Milestone 5 — Simple Admin Dashboard Structure (Slide 9)');
drawParagraph(
  'The Admin Dashboard is built with a simple, clean layout divided into three clear parts:'
);

// Part 1: Summary Cards (Slide 9)
drawSubHeading('6.1 Part 1: Summary Cards (Slide 9)');
const cardY = doc.y;
const cardW = 120;
const cardH = 43;
drawMetricCard(36, cardY, cardW, cardH, 'PRODUCTS', '8', 'Active products', C.accentBlue);
drawMetricCard(168, cardY, cardW, cardH, 'ORDERS', '3', 'Customer orders', C.emerald);
drawMetricCard(300, cardY, cardW, cardH, 'LOW STOCK', '1', '5 or fewer items left', C.rose);
drawMetricCard(432, cardY, 127, cardH, 'REVENUE', 'LKR 1,170,000', 'Total revenue', C.tealLight);
doc.y = cardY + cardH + 6;

// Part 2: Product CRUD (Slide 10)
drawSubHeading('6.2 Part 2: Products & Inventory Management (Task A - Slide 10)');
const cW = 120;
const cH = 44;
const tAY = doc.y;
drawFlowStep(36, tAY, cW, cH, 'CREATE', 'Add a new product\nFill name, price, stock\nand image in form.', 'ADD PRODUCT', false);
drawFlowStep(168, tAY, cW, cH, 'READ', 'List & search products\nShows ID, name, price,\nstock and status.', 'SEARCH & LIST', false);
drawFlowStep(300, tAY, cW, cH, 'UPDATE', 'Edit product & stock\nUse + / - stock buttons\nor edit details modal.', 'EDIT / STOCK', true);
drawFlowStep(432, tAY, 127, cH, 'DELETE', 'Deactivate safely\nSoft-delete keeps past\norder records safe.', 'SOFT-DELETE', true);
doc.y = tAY + cH + 6;

// Part 3: Orders Table (Slide 11)
drawSubHeading('6.3 Part 3: Orders List & Status Updates (Task B - Slide 11)');
drawParagraph(
  'Admins can view customer orders and update the fulfillment status with a single click:'
);

drawCodeBox(
  'Status Workflow:  Pending ---> Paid ---> Processing ---> Shipped ---> Completed   (or Cancelled)\n\n' +
  'Orders Table Layout (Slide 11):\n' +
  '+----------+----------------------+--------------------+---------------+-----------+-------------------------+\n' +
  '| Order ID | Customer Name        | Products           | Total (LKR)   | Status    | Action                  |\n' +
  '+----------+----------------------+--------------------+---------------+-----------+-------------------------+\n' +
  '| #KR-1031 | A. Perera            | Aurelia Classic    | LKR   385,000 | Pending   | Mark Paid               |\n' +
  '| #KR-1032 | N. Silva             | Speedmaster Chrono | LKR   295,000 | Paid      | Mark Processing         |\n' +
  '| #KR-1033 | K. Fernando          | Grand Horizon Rose | LKR   490,000 | Shipped   | View Details            |\n' +
  '+----------+----------------------+--------------------+---------------+-----------+-------------------------+'
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 5: API ENDPOINTS, DEBUGGING LOG & CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
drawPageHeader(
  'ICT2142 E-Business Systems — Student Lab Report & Project Diary',
  'API Endpoints, Debugging Log & Integration Checklist (Slides 12–14)'
);

drawSectionHeading('7', 'API Endpoints Summary');
drawCodeBox(
  '+--------+----------------------------+------------------------------------------------------+-------------+\n' +
  '| Method | Endpoint                   | Purpose                                              | Access      |\n' +
  '+--------+----------------------------+------------------------------------------------------+-------------+\n' +
  '| GET    | /api/products              | Get list of active products from database            | Public      |\n' +
  '| POST   | /api/products              | Add a new product to database                        | Admin only  |\n' +
  '| GET    | /api/products/[id]         | Get single product details by ID                     | Public      |\n' +
  '| PUT    | /api/products/[id]         | Update product name, price, and stock                | Admin only  |\n' +
  '| DELETE | /api/products/[id]         | Soft-delete or deactivate product                    | Admin only  |\n' +
  '| GET    | /api/products/stats        | Get summary numbers (total products, low stock, etc) | Admin only  |\n' +
  '| GET    | /api/orders                | Get list of all customer orders                      | Admin only  |\n' +
  '| POST   | /api/orders                | Validate cart, recalculate total, save order & stock | User        |\n' +
  '| GET    | /api/orders/[id]           | Get order details by order ID                        | User/Admin  |\n' +
  '| PATCH  | /api/orders/[id]/status    | Change order status (Pending -> Paid -> Shipped)     | Admin only  |\n' +
  '| POST   | /api/auth/login            | Verify login credentials and issue role token        | Public      |\n' +
  '| POST   | /api/auth/register         | Create new customer account                          | Public      |\n' +
  '+--------+----------------------------+------------------------------------------------------+-------------+'
);

drawSectionHeading('8', 'Debugging Log: Two Problems Solved (Slide 13)');
drawSubHeading('8.1 Problem 1: Next.js Middleware Crashed When Verifying Tokens');
drawParagraph(
  '• What happened: In frontend/middleware.ts, importing the standard jsonwebtoken library caused build errors because Next.js Edge Middleware runs in a lightweight runtime that does not support the Node.js crypto module.\n' +
  '• How it was solved: We wrote a simple, standalone base64url token decoder directly inside middleware.ts. It reads the role (admin vs customer) and expiration date quickly without needing any external library.'
);

drawSubHeading('8.2 Problem 2: Browser Could Submit Altered Order Prices');
drawParagraph(
  '• What happened: During testing, we noticed that if checkout accepted the total calculated by JavaScript in the browser, an altered payload could send an incorrect price or order items that were out of stock.\n' +
  '• How it was solved: We updated lib/server/db.ts to never trust browser totals. The server reads the verified prices directly from the database, checks that stock is available, recalculates the subtotal, and reduces stock automatically.'
);

drawSectionHeading('9', 'Integration Testing Checklist & Sign-Off (Slide 12 & 14)');
drawCodeBox(
  '[x] Customer Catalog: Products load from database, and product detail pages open correctly.\n' +
  '[x] Authentication: Logged-in users stay connected to their profile and their orders.\n' +
  '[x] Cart -> Checkout: Selected items and quantities transfer correctly into the order.\n' +
  '[x] Order Persistence: Orders remain saved in database after page refresh and re-login.\n' +
  '[x] Inventory Stock: Stock decreases automatically when an order is completed.\n' +
  '[x] Admin Security: Customer accounts cannot access protected /admin pages.\n' +
  '[x] Admin Changes: Product and order edits made in admin immediately appear in customer views.'
);

drawCallout(
  'Week 08 Complete — Ready for Week 09',
  'All Week 08 tasks are complete. The store now uses persistent database storage and has a working admin dashboard. We are ready for Week 09: Testing & Bug Fixing (QA).',
  C.emerald,
  C.emeraldLight
);

// ─── Document Footers ───────────────────────────────────────────────────────
const pages = doc.bufferedPageRange();
const total = pages.count;

for (let i = 0; i < total; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0;

  doc.strokeColor(C.border).lineWidth(0.5)
    .moveTo(36, 804).lineTo(559, 804).stroke();

  doc.font('Helvetica').fontSize(7).fillColor(C.textMuted)
    .text('Krono Watches • ICT2142 E-Business Systems • Week 08 Lab Report', 36, 810, { lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(7).fillColor(C.accentBlue)
    .text(`Page ${i + 1} of ${total}`, 454, 810, { width: 105, align: 'right', lineBreak: false });
}

doc.end();

writeStream.on('finish', () => {
  try {
    fs.mkdirSync(artifactDir, { recursive: true });
    fs.copyFileSync(outputPath, artifactPath);
    console.log('PDF successfully copied to artifact directory:', artifactPath);
  } catch (err) {
    console.warn('Artifact copy warning:', err);
  }
  console.log('PDF generation complete. Total pages:', total, 'Path:', outputPath);
});
