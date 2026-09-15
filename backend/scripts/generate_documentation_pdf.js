const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = 'c:/Users/Razim/Desktop/EcomProject/ICT2142_Week06_Documentation_and_Lab_Diary.pdf';
const artifactPath = path.join(
  'C:/Users/Razim/.gemini/antigravity-ide/brain/481990e0-e5ad-4c6c-a6d6-c4baab1e49a6',
  'ICT2142_Week06_Documentation_and_Lab_Diary.pdf'
);

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 32, bottom: 35, left: 40, right: 40 },
  bufferPages: true,
  autoFirstPage: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// ─── Color Palette ──────────────────────────────────────────────────────────
const C = {
  primaryDark: '#0F172A',
  secondaryDark: '#1E293B',
  accentBlue: '#0284C7',
  accentBlueLight: '#E0F2FE',
  accentTeal: '#0D9488',
  gold: '#B45309',
  goldLight: '#FEF3C7',
  textMain: '#1E293B',
  textSub: '#475569',
  textMuted: '#64748B',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  codeBg: '#F8FAFC',
  codeBorder: '#CBD5E1',
  successBg: '#DCFCE7',
  successText: '#166534',
  successBorder: '#86EFAC',
};

// ─── Helper Functions ───────────────────────────────────────────────────────
function drawPageHeader(title, subtitle) {
  const y = 32;
  doc.rect(40, y, 515, 44).fill(C.primaryDark);

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF')
    .text(title, 52, y + 8, { width: 491, lineBreak: false });

  doc.font('Helvetica').fontSize(8).fillColor('#94A3B8')
    .text(subtitle, 52, y + 26, { width: 491, lineBreak: false });

  doc.y = y + 52;
}

function drawSectionHeading(num, title) {
  doc.moveDown(0.4);
  const y = doc.y;
  doc.rect(40, y, 4, 15).fill(C.accentBlue);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.primaryDark)
    .text(`${num}. ${title}`, 50, y + 1, { lineBreak: false });
  doc.y = y + 18;
}

function drawSubHeading(title) {
  doc.moveDown(0.25);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0369A1')
    .text(title, 40, doc.y);
  doc.moveDown(0.15);
}

function drawParagraph(text) {
  doc.font('Helvetica').fontSize(8).fillColor(C.textMain).lineGap(1.5)
    .text(text, 40, doc.y, { width: 515, align: 'justify' });
  doc.moveDown(0.25);
}

function drawCallout(title, text, borderColor = C.accentBlue, bgColor = C.accentBlueLight) {
  const startY = doc.y;
  doc.rect(40, startY, 515, 42).fillAndStroke(bgColor, borderColor);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.primaryDark)
    .text(title, 50, startY + 6, { lineBreak: false });
  doc.font('Helvetica').fontSize(7.5).fillColor(C.textSub)
    .text(text, 50, startY + 18, { width: 495, lineGap: 1.2 });
  doc.y = startY + 48;
}

function drawCodeBox(codeString) {
  const lines = codeString.split('\n');
  const boxHeight = lines.length * 9.2 + 10;

  const startY = doc.y;
  doc.rect(40, startY, 515, boxHeight).fillAndStroke(C.codeBg, C.codeBorder);

  let curY = startY + 5;
  for (const line of lines) {
    doc.font('Courier').fontSize(7).fillColor(C.primaryDark)
      .text(line, 48, curY, { lineBreak: false });
    curY += 9.2;
  }
  doc.y = startY + boxHeight + 5;
}

function drawFlowStep(x, y, w, h, title, desc, tag = '', isAccent = false) {
  doc.rect(x, y, w, h).fillAndStroke(isAccent ? '#F0F9FF' : '#FFFFFF', isAccent ? C.accentBlue : C.border);
  if (tag) {
    doc.rect(x + w - 52, y + 3, 46, 11).fill(isAccent ? C.accentBlue : '#E2E8F0');
    doc.font('Helvetica-Bold').fontSize(6).fillColor(isAccent ? '#FFFFFF' : C.textSub)
      .text(tag, x + w - 52, y + 5, { width: 46, align: 'center', lineBreak: false });
  }
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.primaryDark)
    .text(title, x + 6, y + 5, { lineBreak: false });
  doc.font('Helvetica').fontSize(7).fillColor(C.textSub)
    .text(desc, x + 6, y + 16, { width: w - 12, lineGap: 1 });
}

function drawDownArrow(x, yFrom, yTo) {
  doc.strokeColor(C.accentBlue).lineWidth(1.2)
    .moveTo(x, yFrom).lineTo(x, yTo).stroke();
  doc.fillColor(C.accentBlue)
    .polygon([x, yTo], [x - 3, yTo - 5], [x + 3, yTo - 5]).fill();
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 1: COVER, OBJECTIVES & AUTH ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════
drawPageHeader(
  'ICT2142 E-Business Systems — Technical Documentation & Lab Diary',
  'Week 06 Practical: User Authentication, Session Management & Profile Dashboard'
);

// Metadata Block
const mY = doc.y;
doc.rect(40, mY, 515, 52).fillAndStroke('#F8FAFC', C.borderLight);
doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.primaryDark).text('Course Module:', 48, mY + 6, { lineBreak: false });
doc.font('Helvetica').fontSize(7.5).fillColor(C.textSub).text('ICT2142 E-Business Systems (E-Commerce Web Development Series)', 122, mY + 6, { lineBreak: false });

doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.primaryDark).text('Production Site:', 48, mY + 18, { lineBreak: false });
doc.font('Helvetica').fontSize(7.5).fillColor(C.textSub).text('Krono — Swiss Mechanical Haute Horlogerie (Next.js + Express + Supabase)', 122, mY + 18, { lineBreak: false });

doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.primaryDark).text('Milestone Scope:', 48, mY + 30, { lineBreak: false });
doc.font('Helvetica').fontSize(7.5).fillColor(C.textSub).text('Milestones 1-4 (Register, Login, Protected Routes, Profile) + Session/Cookies', 122, mY + 30, { lineBreak: false });

doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.primaryDark).text('Git Repository:', 48, mY + 42, { lineBreak: false });
doc.font('Helvetica').fontSize(7.5).fillColor(C.accentBlue).text('github.com/mohamedrazim11-maker/Krono_Watches (Branch: main)', 122, mY + 42, { lineBreak: false });

doc.y = mY + 58;

drawSectionHeading('1', 'Executive Summary & Laboratory Objectives');
drawParagraph(
  'This report satisfies the mandatory laboratory documentation requirements for Week 06 of the E-Commerce Web Development practical series. The primary objective is establishing an enterprise-grade customer security lifecycle for the Krono horology e-commerce platform, covering cryptographically secure user registration, token and cookie-based session management, multi-device tracking, route protection guards, and profile management with shopping cart consolidation.'
);

drawCallout(
  'Core Lab Deliverables Completed',
  '1. Practical Milestone 1: User Registration System with regex validation & bcrypt hashing (10 salt rounds).\n' +
  '2. Practical Milestone 2: Authentication & Login with JWT token signing & secure HTTP-only cookies.\n' +
  '3. Practical Milestone 3: Route Protection guards on /profile, /account, /checkout & secure logout.\n' +
  '4. Practical Milestone 4: Customer Profile Dashboard (Multiple addresses, identity re-verification, cart sync).'
);

drawSectionHeading('2', 'Authentication Architecture & Visual State Flows');
drawParagraph(
  'The platform utilizes a decoupled, secure client-server model. The Next.js client coordinates authentication state via an AuthProvider context and dedicated session/cookie engines, while the Express backend enforces authentication via requireAuth middleware and an in-memory session registry.'
);

drawSubHeading('2.1 Visual Flow: User Registration & Account Creation');

const regY = doc.y + 2;
drawFlowStep(40, regY, 155, 38, '1. Client Input Form', 'Name, email, pwd, confirm\nRegex format & match checks', 'CLIENT', false);
drawDownArrow(117, regY + 38, regY + 48);

drawFlowStep(40, regY + 48, 155, 38, '2. POST /api/auth/register', 'JSON payload dispatched\nCredentials include header', 'HTTP POST', true);

drawFlowStep(220, regY, 155, 38, '3. Duplicate Check', 'checkUserExists(email)\nReturns 409 if duplicate', 'DATABASE', false);
drawDownArrow(297, regY + 38, regY + 48);

drawFlowStep(220, regY + 48, 155, 38, '4. Bcrypt Hash (Cost 10)', 'hashedPw = hash(pwd, 10)\nIrreversible password hash', 'SECURITY', true);
drawDownArrow(297, regY + 86, regY + 96);

drawFlowStep(40, regY + 96, 155, 38, '5. Database Insert', 'Stores user_id, email,\nhash, role in Supabase / DB', 'PERSIST', false);

drawFlowStep(220, regY + 96, 155, 38, '6. Session & JWT Signing', 'Signs JWT { sub, name, ... }\nCreates session UUID', 'SERVER', true);

drawFlowStep(400, regY + 96, 155, 38, '7. Cookies & Response', 'Set-Cookie: krono_token\n201 Created -> /profile redirect', 'HTTP-ONLY', true);

doc.y = regY + 140;

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 2: LOGIN FLOW, LOGOUT FLOW & SECURITY MATRIX
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
drawPageHeader(
  'ICT2142 E-Business Systems — Technical Documentation & Lab Diary',
  'Section 2 & 3: Visual State Flows & Security Considerations'
);

drawSubHeading('2.2 Visual Flow: User Authentication & Multi-Device Session Persistence');

const logY = doc.y + 2;
drawFlowStep(40, logY, 155, 38, '1. Client Login Form', 'Email, password credentials\nOptional "Remember Me" toggle', 'USER UI', false);
drawDownArrow(117, logY + 38, logY + 48);

drawFlowStep(40, logY + 48, 155, 38, '2. POST /api/auth/login', 'Cross-origin request\ncredentials: "include"', 'EXPRESS', true);

drawFlowStep(220, logY, 155, 38, '3. Credential Verify', 'Retrieves user record\nbcrypt.compare(pwd, hash)', 'BCRYPT', false);
drawDownArrow(297, logY + 38, logY + 48);

drawFlowStep(220, logY + 48, 155, 38, '4. Session & Cookie Setup', 'Registers session ID (IP, Agent)\n7d vs 30d TTL; Signs JWT', 'SESSION', true);

drawFlowStep(400, logY, 155, 38, '5. Multi-Tab Sync', 'BroadcastChannel notifies\nall browser tabs of login', 'CROSS-TAB', true);
drawDownArrow(477, logY + 38, logY + 48);

drawFlowStep(400, logY + 48, 155, 38, '6. Cart Association', 'mergeGuestCart() unifies\nanonymous items into user cart', 'CART SYNC', false);

doc.y = logY + 94;

drawSubHeading('2.3 Visual Flow: Secure Logout & Immediate Revocation');
drawCodeBox(
  '+-------------------------+     POST /api/auth/logout      +-----------------------------------------+\n' +
  '| Client Initiates Logout | -----------------------------> | Express Auth Controller:                |\n' +
  '| (Navbar / Profile CTA)  |                                |  - Revokes sessionId in sessionManager   |\n' +
  '+-------------------------+                                |  - Clear-Cookie: krono_token (MaxAge: 0)|\n' +
  '             |                                             |  - Clear-Cookie: krono_session (0)       |\n' +
  '             v                                             +-----------------------------------------+\n' +
  '  BroadcastChannel("krono_auth_sync")                                           |\n' +
  '             |                                                                 v\n' +
  '  +-------------------------------------+             +-----------------------------------------------+\n' +
  '  | ALL open tabs receive LOGOUT event   |             | HTTP 200 OK Response:                         |\n' +
  '  | Client wipes localStorage tokens    | <---------- | Client session terminated, router redirects   |\n' +
  '  | UI resets instantly to Guest view   |             | user smoothly to public homepage ("/")        |\n' +
  '  +-------------------------------------+             +-----------------------------------------------+'
);

drawSectionHeading('3', 'Security Considerations & Defensive Matrix');
drawParagraph(
  'To protect customer privacy and meet electronic commerce security requirements, the platform implements strict defensive measures against injection, XSS, CSRF, and timing attacks.'
);

drawSubHeading('3.1 Password Hashing Architecture (Bcrypt 10 Salt Rounds)');
drawParagraph(
  'Plaintext passwords are never stored or logged in plain text. Password hashes are generated via bcryptjs using 10 salt rounds (2^10 iterations). The algorithm introduces cryptographically random salt to neutralize rainbow table attacks and includes a deliberate computational work factor to thwart brute-force cracking attempts.'
);

drawSubHeading('3.2 Prevention of User Enumeration');
drawParagraph(
  'Authentication failures return an identical generic message: "Invalid email or password" with HTTP 401 Unauthorized regardless of whether the email was missing from the database or the password hash comparison failed. This prevents threat actors from harvesting registered client addresses.'
);

drawSubHeading('3.3 Three-Tier Cookie Safety Matrix');
drawParagraph(
  'Cookies are configured with defensive attributes to prevent cross-site scripting (XSS) and cross-site request forgery (CSRF):'
);

drawCodeBox(
  '+------------------------+----------+----------+--------+---------------------------------------------+\n' +
  '| Cookie Name            | HttpOnly | SameSite | Secure | Security Purpose & Defense Function         |\n' +
  '+------------------------+----------+----------+--------+---------------------------------------------+\n' +
  '| krono_token            | YES      | Lax      | Auto   | Cryptographically signed JWT. Immune to XSS.|\n' +
  '| krono_session          | YES      | Lax      | Auto   | Opaque session UUID for server revocation.  |\n' +
  '| krono_client_session   | NO       | Lax      | Auto   | Client metadata (name, email) for SSR speed.|\n' +
  '+------------------------+----------+----------+--------+---------------------------------------------+'
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 3: ROUTE PROTECTION, CART & API SPECIFICATION
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
drawPageHeader(
  'ICT2142 E-Business Systems — Technical Documentation & Lab Diary',
  'Section 3 & 4: Route Guards & Technical API Specification'
);

drawSubHeading('3.4 Route Protection Guards & Return URL Context (Milestone 3)');
drawParagraph(
  'Protected routes (/profile, /account, /checkout) are shielded by client-side hooks and backend middleware. Unauthenticated visitors are intercepted and redirected to /login?returnUrl=<target>&unauthorized=true. Once authenticated, the router automatically reads returnUrl and navigates the client back to their intended step.'
);

drawSubHeading('3.5 Anonymous-to-Authenticated Cart Association (Milestone 4)');
drawParagraph(
  'When an unauthenticated visitor adds luxury timepieces to the shopping bag, items are saved in guest storage. Upon authentication, mergeGuestCart() cross-references the guest cart against user account items, aggregates quantities for duplicate items, and commits the consolidated array to the persistent store.'
);

drawSectionHeading('4', 'API Specification — Endpoints & Contracts');

drawSubHeading('4.1 POST /api/auth/register (Milestone 1 — Registration)');
drawCodeBox(
  'Request:  POST /api/auth/register\n' +
  'Headers:  Content-Type: application/json\n' +
  'Body:     { "name": "Dev Student", "email": "dev.student@krono-watches.com", "password": "Password123!", "confirmPassword": "Password123!" }\n' +
  'Response: 201 Created\n' +
  'Cookies:  Set-Cookie: krono_token=<jwt>; HttpOnly; SameSite=Lax; Path=/\n' +
  '          Set-Cookie: krono_session=ses_<uuid>; HttpOnly; SameSite=Lax; Path=/\n' +
  'Body:     { "success": true, "message": "Client account created successfully.", "token": "eyJhbGciOi...", "user": { "id": "user-101", ... } }'
);

drawSubHeading('4.2 POST /api/auth/login (Milestone 2 — Login & Persistent Session)');
drawCodeBox(
  'Request:  POST /api/auth/login\n' +
  'Headers:  Content-Type: application/json\n' +
  'Body:     { "email": "dev.student@krono-watches.com", "password": "Password123!", "rememberMe": true }\n' +
  'Response: 200 OK\n' +
  'Cookies:  Set-Cookie: krono_token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=2592000; Path=/\n' +
  '          Set-Cookie: krono_session=ses_<uuid>; HttpOnly; SameSite=Lax; Max-Age=2592000; Path=/\n' +
  'Body:     { "success": true, "message": "Login successful.", "token": "eyJhbGciOi...", "session": { "id": "ses_...", ... } }'
);

drawSubHeading('4.3 GET /api/auth/profile (Milestone 4 — Profile & Addresses)');
drawCodeBox(
  'Request:  GET /api/auth/profile\n' +
  'Headers:  Authorization: Bearer <jwt> OR Cookie: krono_token=<jwt>\n' +
  'Response: 200 OK\n' +
  'Body:     { "success": true, "user": { "id": "user-101", "name": "Dev Student", "email": "...", "phone": "+94 77 123", "address": "...", ... } }'
);

drawSubHeading('4.4 Session Management & Device Endpoints');
drawCodeBox(
  'GET    /api/auth/session          -> Inspects active session status, remaining TTL, cookie attributes\n' +
  'POST   /api/auth/session/refresh  -> Renews session lifetime and issues refreshed cookies\n' +
  'GET    /api/auth/sessions         -> Returns all active devices & concurrent terminals for user\n' +
  'DELETE /api/auth/sessions/:id     -> Remotely revokes a specific device session\n' +
  'POST   /api/auth/sessions/revoke-others -> Terminates all active sessions except current terminal\n' +
  'POST   /api/auth/logout           -> Revokes session, clears cookies, returns 200 OK'
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 4: DEBUGGING NOTES & TROUBLESHOOTING LOG
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
drawPageHeader(
  'ICT2142 E-Business Systems — Technical Documentation & Lab Diary',
  'Section 5: Comprehensive Debugging Notes & Technical Resolutions'
);

drawSectionHeading('5', 'Debugging Notes, Edge Cases & Technical Resolutions');
drawParagraph(
  'The following log captures the troubleshooting records, edge cases encountered during development, and the engineering resolutions applied:'
);

drawSubHeading('Entry 1: CORS & Cross-Origin Cookie Dropping');
drawParagraph(
  '• Symptom: Client successfully received 200 OK on login, but subsequent calls to /api/auth/profile returned 401 Unauthorized because the browser discarded the Set-Cookie headers.\n' +
  '• Root Cause: Express CORS was configured as app.use(cors()) without credentials: true, and fetch did not set credentials: "include". Browsers disallow cross-origin cookie storage unless both flags are set.\n' +
  '• Resolution: Configured Express cors with dynamic origin verification and credentials: true. Added credentials: "include" to all API calls in api.ts.'
);

drawSubHeading('Entry 2: Stateless JWT Inability to Revoke Prior to Expiry');
drawParagraph(
  '• Symptom: When a user signed out or requested password reset, previously issued tokens remained technically valid until natural expiry (7 days).\n' +
  '• Root Cause: Pure stateless JWTs cannot be invalidated server-side without a persistence tracker.\n' +
  '• Resolution: Created backend/src/utils/sessionManager.js with an active session registry. RequireAuth verifies that the session UUID in the cookie remains active in memory before authorizing requests.'
);

drawSubHeading('Entry 3: Multi-Tab State Desynchronization');
drawParagraph(
  '• Symptom: Signing out in Tab A left Tab B displaying active user profile controls until an action failed with 401.\n' +
  '• Root Cause: Browsers maintain isolated execution threads per tab without native context sharing.\n' +
  '• Resolution: Implemented BroadcastChannel("krono_auth_sync") with localStorage fallback in sessionManager.ts. Emits LOGIN, LOGOUT, and REFRESH events across all open tabs.'
);

drawSubHeading('Entry 4: Guest Cart Overwriting Account Items');
drawParagraph(
  '• Symptom: Adding watches as a guest and logging in wiped out previously saved user cart items.\n' +
  '• Root Cause: Naive cart handler overwrote user storage with guest cart contents upon authentication.\n' +
  '• Resolution: Built mergeGuestCart() in AuthContext. Compares product IDs, sums unit quantities, updates both guest and user keys, and updates the cart badge.'
);

drawSubHeading('Entry 5: Unsplash Placeholder Image Contamination');
drawParagraph(
  '• Symptom: External Unsplash photos of makeup brushes and coffee appeared on luxury dive watches (Omega Seamaster Aqua Terra).\n' +
  '• Root Cause: Default seed data referenced uncurated external Unsplash photo IDs.\n' +
  '• Resolution: Implemented BANNED_IMAGE_PATTERNS in productImages.ts. Replaced all external image references with verified local high-resolution Swiss timepiece photography.'
);

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 5: DELIVERABLES CHECKLIST & CONCLUSION
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
drawPageHeader(
  'ICT2142 E-Business Systems — Technical Documentation & Lab Diary',
  'Section 6 & 7: Deliverables Checklist & Week 7 Preview'
);

drawSectionHeading('6', 'Today\'s Deliverables & Verification Checklist');

drawCodeBox(
  '+---------------------------------------------------+------------+-------------------------------+\n' +
  '| Practical Task Requirement                        | Status     | Verification Evidence         |\n' +
  '+---------------------------------------------------+------------+-------------------------------+\n' +
  '| 1. User Registration System                       | COMPLETED  | POST /api/register (201)      |\n' +
  '|    - Name, Email, Password, Confirm Password      | Verified   | Regex complexity validation   |\n' +
  '|    - Bcrypt password hashing (10 salt rounds)     | Verified   | No plaintext in DB            |\n' +
  '|                                                   |            |                               |\n' +
  '| 2. Authentication & Login                         | COMPLETED  | POST /api/login (200)         |\n' +
  '|    - Credential verification (bcrypt.compare)     | Verified   | 401 on bad credentials        |\n' +
  '|    - JWT Token Signing (sub, name, email, role)   | Verified   | Compliant payload format      |\n' +
  '|    - HTTP-Only Cookie Persistence                 | Verified   | krono_token & krono_session   |\n' +
  '|    - Remember Me (30-day extended session)        | Verified   | Optional TTL extension        |\n' +
  '|                                                   |            |                               |\n' +
  '| 3. Protected Routes & Secure Logout               | COMPLETED  | requireAuth middleware        |\n' +
  '|    - Guards on /profile, /account, /checkout      | Verified   | Redirect to /login?returnUrl  |\n' +
  '|    - Context preservation via return URL          | Verified   | Seamless post-login return    |\n' +
  '|    - Token & Cookie clearance on logout           | Verified   | Cookies wiped (epoch 1970)    |\n' +
  '|                                                   |            |                               |\n' +
  '| 4. Customer Profile Management                    | COMPLETED  | /profile Dashboard            |\n' +
  '|    - Dynamic client profile display & badge       | Verified   | Full name, email, status      |\n' +
  '|    - Functional form for contact phone & 2 addrs  | Verified   | Primary + secondary address   |\n' +
  '|    - Identity re-verification for password change | Verified   | Checks current password hash  |\n' +
  '|    - Cart association (guest item merging)        | Verified   | Preserves items across auth   |\n' +
  '|                                                   |            |                               |\n' +
  '| 5. Session & Cookie Architecture                  | COMPLETED  | Session Management Engine     |\n' +
  '|    - Concurrent active device list & revocation   | Verified   | /api/auth/sessions            |\n' +
  '|    - Background heartbeat & multi-tab sync        | Verified   | BroadcastChannel sync         |\n' +
  '|    - Session expiration warning banner            | Verified   | Live countdown & renewal      |\n' +
  '+---------------------------------------------------+------------+-------------------------------+'
);

drawSectionHeading('7', 'Conclusion & Readiness for Week 7 (Checkout & Payments)');
drawParagraph(
  'All required practical tasks, security imperatives, and architectural specifications for Week 06 have been thoroughly developed, verified with automated TypeScript checks (npx tsc --noEmit: 0 errors), and deployed to the GitHub repository. The platform provides a rock-solid security foundation for the upcoming Week 7 checkout and payment gateway integrations.'
);

drawCallout(
  'Week 7 Preview: Checkout & Payments Integration',
  '• Integration of secure payment gateways (Stripe / LKR card acquirers).\n' +
  '• Complex e-commerce transaction flows and order generation.\n' +
  '• Order confirmation certificates, wrist sizing options, and armored courier tracking.',
  C.accentTeal,
  '#F0FDFA'
);

// ─── Document Footers (Guaranteed NO auto-page additions) ───────────────────
const pages = doc.bufferedPageRange();
const total = pages.count;

for (let i = 0; i < total; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0; // Prevent auto page break on text overflow
  
  // Footer divider line
  doc.strokeColor(C.border).lineWidth(0.5)
    .moveTo(40, 804).lineTo(555, 804).stroke();

  // Left footer label
  doc.font('Helvetica').fontSize(7.5).fillColor(C.textMuted)
    .text('Krono Haute Horlogerie • ICT2142 E-Business Systems Lab Series', 40, 810, { lineBreak: false });

  // Right page counter
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.accentBlue)
    .text(`Page ${i + 1} of ${total}`, 450, 810, { width: 105, align: 'right', lineBreak: false });
}

doc.end();

writeStream.on('finish', () => {
  try {
    fs.copyFileSync(outputPath, artifactPath);
    console.log('PDF successfully copied to artifact directory:', artifactPath);
  } catch (err) {
    console.warn('Artifact copy warning:', err);
  }
  console.log('PDF generation complete. Total pages:', total, 'Path:', outputPath);
});
