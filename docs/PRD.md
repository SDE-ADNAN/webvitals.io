# WebVitals.io - Product Requirements Document (PRD)

**Project Name:** WebVitals.io - Real-Time Web Performance Monitoring SaaS

**Version:** 1.0

**Author:** Adnan Khan (SDE-ADNAN)

**Date:** December 14, 2025

**Total Duration:** 4 Weeks (28 Days)

**Target Release:** January 11, 2026

---

## 1. PROJECT OVERVIEW

### 1.1 Vision

Build a **lightweight, real-time web performance monitoring SaaS** that enables indie developers, freelancers, and small agencies to track Core Web Vitals without the enterprise overhead of tools like Datadog or New Relic.

### 1.2 Target Market

- **Primary:** Indie developers and freelancers ($0-$500/month budget)
- **Secondary:** Small agencies (1-10 developers)
- **Tertiary:** Startups in Series A/B phase looking for cost-effective monitoring

### 1.3 Unique Value Proposition

- **50-70% cheaper** than competitors (Datadog, New Relic, Sentry)
- **Real-time** metric streaming via WebSockets
- **Zero configuration** - Single script tag to embed
- **Beautiful dashboard** designed for developers, not DevOps teams
- **Open-source SDK** - Full transparency and community contributions

### 1.4 Success Metrics

- MVP launched and live by January 11, 2026
- 50+ GitHub stars by February 2026
- 20+ beta users by February 2026
- $500+/month in recurring revenue by Q2 2026

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT WEBSITE                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  tracker.js (2KB gzipped)                                │  │
│  │  - Measures Core Web Vitals (LCP, FID, CLS)             │  │
│  │  - Collects custom events                                │  │
│  │  - Sends data to WebVitals.io backend                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↓ (HTTPS POST)
┌─────────────────────────────────────────────────────────────────┐
│              WEBVITALS.IO BACKEND (Node.js + Express)            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Server (Port 3000)                                    │ │
│  │  - POST /api/metrics (receive metrics)                    │ │
│  │  - GET /api/sites (list monitored sites)                  │ │
│  │  - POST /api/alerts (create alert rules)                  │ │
│  │  - DELETE /api/alerts/:id (delete alert)                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  WebSocket Server (Socket.io)                             │ │
│  │  - Real-time metric streaming to dashboard               │ │
│  │  - Alert notifications                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Job Queue (Bull Queue)                                    │ │
│  │  - Process alert triggers                                 │ │
│  │  - Send emails                                            │ │
│  │  - Cleanup old data                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           ↕ (TCP Connection)
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL + Redis)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL (AWS RDS)                                      │ │
│  │  - Users, Sites, Metrics, AlertRules, AlertHistory       │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Redis (Caching & Queue)                                   │ │
│  │  - Cache dashboard data                                    │ │
│  │  - Job queue for Bull                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           ↕ (HTTPS GET)
┌─────────────────────────────────────────────────────────────────┐
│          FRONTEND DASHBOARD (Next.js + React)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Dashboard Page (Real-time metrics)                        │ │
│  │  Site Details Page (Drill-down analytics)                 │ │
│  │  Alerts Configuration Page                                │ │
│  │  Settings & Billing Page                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack

**Frontend:**

- Next.js 15 (App Router, SSR, SSG)
- React 19
- TypeScript
- Redux Toolkit (State Management)
- Recharts (Data Visualization)
- Tailwind CSS (Styling)
- Socket.io-client (Real-time Updates)
- React Query (Server State Management)
- Zod (Form Validation)

**Backend:**

- Node.js 20 (LTS)
- Express.js 4.x
- TypeScript
- Prisma ORM
- PostgreSQL 15
- Redis
- Socket.io (WebSocket)
- Bull Queue
- JWT (jsonwebtoken)
- Nodemailer (Email Service)
- Zod (Input Validation)

**DevOps & Infrastructure:**

- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS EC2 (Backend Hosting)
- AWS RDS (PostgreSQL Database)
- AWS S3 (Analytics Data Storage)
- AWS CloudWatch (Monitoring)
- Nginx (Reverse Proxy)
- Let's Encrypt (SSL/TLS)

**Additional Tools:**

- Git & GitHub
- ESLint & Prettier
- Jest (Unit Testing)
- Supertest (API Testing)
- Postman (API Documentation)

---

## 3. DATABASE SCHEMA

### 3.1 Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==================== USER MANAGEMENT ====================
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String    // bcrypt hashed
  firstName     String?
  lastName      String?
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sites         Site[]
  apiKeys       ApiKey[]
  alerts        Alert[]

  @@index([email])
}

// ==================== API KEYS ====================
model ApiKey {
  id            Int       @id @default(autoincrement())
  userId        Int
  key           String    @unique // hashed
  name          String
  lastUsedAt    DateTime?
  createdAt     DateTime  @default(now())
  expiresAt     DateTime?

  user          User      @relation(fields: [userId], onDelete: Cascade)

  @@index([userId])
}

// ==================== MONITORED SITES ====================
model Site {
  id            Int       @id @default(autoincrement())
  userId        Int
  name          String    // User-friendly name
  url           String    // Website URL to monitor
  domain        String    // Extracted domain for filtering
  siteId        String    @unique // Public tracking ID (not sequential)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  user          User      @relation(fields: [userId], onDelete: Cascade)
  metrics       Metric[]
  alertRules    AlertRule[]
  alerts        Alert[]

  @@index([userId])
  @@index([siteId])
  @@unique([userId, domain])
}

// ==================== PERFORMANCE METRICS ====================
model Metric {
  id            Int       @id @default(autoincrement())
  siteId        Int

  // Core Web Vitals
  lcp           Float?    // Largest Contentful Paint (milliseconds)
  fid           Float?    // First Input Delay (milliseconds)
  cls           Float?    // Cumulative Layout Shift (0-1 score)

  // Additional Vitals
  ttfb          Float?    // Time to First Byte (milliseconds)
  fcp           Float?    // First Contentful Paint (milliseconds)
  tti           Float?    // Time to Interactive (milliseconds)

  // Device & Browser Info
  deviceType    String    // "mobile" | "desktop" | "tablet"
  browserName   String?   // "Chrome", "Firefox", "Safari"
  osName        String?   // "Windows", "macOS", "Linux", "iOS", "Android"

  // Page Info
  pageUrl       String?   // Full page URL
  pageTitle     String?   // Page title

  // Network Info
  connectionType String?  // "4g", "3g", "wifi", "slow-2g"
  effectiveType String?   // "4g", "3g", "2g", "slow-4g"
  rtt           Int?      // Round-trip time (milliseconds)
  downlink      Float?    // Download speed (Mbps)

  // Metadata
  sessionId     String?   // Session tracking
  userId        String?   // Anonymous user ID (if provided)
  timestamp     DateTime  @default(now())

  // Relations
  site          Site      @relation(fields: [siteId], onDelete: Cascade)

  @@index([siteId, timestamp])
  @@index([timestamp])
  @@index([deviceType])
  @@index([browserName])
}

// ==================== ALERT RULES ====================
model AlertRule {
  id            Int       @id @default(autoincrement())
  siteId        Int
  userId        Int

  // Alert Configuration
  metricType    String    // "lcp", "fid", "cls", "ttfb", "fcp"
  operator      String    // "greater_than", "less_than", "equals"
  threshold     Float     // Threshold value

  // Conditions
  deviceType    String?   // Optional filter: "mobile", "desktop", etc.
  minOccurrences Int      @default(3) // Alert only if threshold crossed 3+ times

  // Status
  isEnabled     Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  site          Site      @relation(fields: [siteId], onDelete: Cascade)
  user          User      @relation(fields: [userId], onDelete: Cascade)
  alerts        Alert[]

  @@index([siteId])
  @@index([userId])
}

// ==================== ALERT HISTORY ====================
model Alert {
  id            Int       @id @default(autoincrement())
  siteId        Int
  userId        Int
  alertRuleId   Int

  // Alert Details
  metricValue   Float
  thresholdValue Float
  severity      String    // "warning" | "critical"
  message       String

  // Status
  status        String    @default("open") // "open", "acknowledged", "resolved"
  acknowledgedAt DateTime?
  resolvedAt    DateTime?

  // Email Status
  emailSent     Boolean   @default(false)
  emailSentAt   DateTime?

  createdAt     DateTime  @default(now())

  // Relations
  site          Site      @relation(fields: [siteId], onDelete: Cascade)
  user          User      @relation(fields: [userId], onDelete: Cascade)
  alertRule     AlertRule @relation(fields: [alertRuleId], onDelete: Cascade)

  @@index([siteId, createdAt])
  @@index([userId])
  @@index([status])
}

// ==================== AUDIT LOG ====================
model AuditLog {
  id            Int       @id @default(autoincrement())
  userId        Int?
  action        String    // "site_created", "alert_triggered", "user_login"
  resource      String    // "site", "alert", "user"
  resourceId    Int?
  details       String?   // JSON stringified details
  ipAddress     String?
  userAgent     String?
  timestamp     DateTime  @default(now())

  @@index([userId, timestamp])
  @@index([action])
}
```

### 3.2 Database Indexes

```sql
-- Indexes for Query Performance
CREATE INDEX idx_metric_site_timestamp ON "Metric"(siteId, timestamp DESC);
CREATE INDEX idx_metric_device_type ON "Metric"(deviceType);
CREATE INDEX idx_metric_browser ON "Metric"(browserName);
CREATE INDEX idx_alert_site_status ON "Alert"(siteId, status);
CREATE INDEX idx_alertrule_site_enabled ON "AlertRule"(siteId, isEnabled);
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_site_user_domain ON "Site"(userId, domain);

-- Composite indexes for common queries
CREATE INDEX idx_metrics_aggregation ON "Metric"(
  siteId,
  timestamp DESC,
  deviceType
);
```

---

## 4. PROJECT TIMELINE & MILESTONES

### WEEK 1: Frontend Dashboard & Infrastructure Setup

**Duration:** 7 Days (Dec 14 - Dec 20, 2025)

#### Milestone 1.1: Project Scaffolding & Git Setup (Day 1)

**Commits:**

```
git commit -m "init: scaffold Next.js project with TypeScript and Tailwind"
git commit -m "docs: add project README with architecture overview"
git commit -m "chore: add .gitignore, .env.example, and project config"
git commit -m "ci: configure GitHub Actions workflow template"
```

**Deliverables:**

- ✅ Next.js 15 project initialized with TypeScript
- ✅ Tailwind CSS configured
- ✅ ESLint & Prettier setup
- ✅ Git repository with protected main branch
- ✅ GitHub Actions workflow template created

**Tasks:**

1. Run: `npx create-next-app@latest webvitals-dashboard --typescript --tailwind`
2. Add Prettier config: `.prettierrc.json`
3. Add ESLint config for TypeScript
4. Create `.env.example` with required variables
5. Create README.md with setup instructions
6. Initialize Git and create main/develop branches
7. Create GitHub Actions template (.github/workflows/test.yml)

**Success Criteria:**

- Project runs locally: `npm run dev`
- Linting passes: `npm run lint`
- Format check passes: `npm run format:check`

---

#### Milestone 1.2: Layout & Navigation Components (Day 2-3)

**Commits:**

```
git commit -m "feat: create base layout with sidebar and header"
git commit -m "feat: add navigation menu with active state tracking"
git commit -m "feat: implement dark/light mode toggle with localStorage"
git commit -m "feat: add responsive mobile navigation"
```

**Deliverables:**

- ✅ Main layout wrapper component
- ✅ Sidebar navigation
- ✅ Top header/navbar
- ✅ Dark/Light mode switcher
- ✅ Mobile responsive design

**Components to Create:**

```
app/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   └── MobileNav.tsx
│   ├── Navigation/
│   │   ├── NavMenu.tsx
│   │   └── NavLink.tsx
│   └── Theme/
│       └── ThemeToggle.tsx
└── layout.tsx
```

**Success Criteria:**

- Layout renders without errors
- Theme toggle works (stores preference in localStorage)
- Mobile navigation visible on screens < 768px
- All navigation links navigate correctly

---

#### Milestone 1.3: Dashboard Landing Page (Day 4-5)

**Commits:**

```
git commit -m "feat: create dashboard page with site overview cards"
git commit -m "feat: add mock data for demonstration"
git commit -m "feat: implement empty state for new users"
git commit -m "feat: add 'Add New Site' button with modal"
```

**Deliverables:**

- ✅ Dashboard landing page
- ✅ Site overview cards (mock data)
- ✅ Empty state UI for new users
- ✅ "Add New Site" button & modal dialog

**Page Structure:**

```
app/dashboard/
├── page.tsx (main dashboard)
├── components/
│   ├── SiteCard.tsx
│   ├── SiteOverviewGrid.tsx
│   ├── EmptyState.tsx
│   └── AddSiteModal.tsx
```

**Mock Data:**

```typescript
const mockSites = [
  {
    id: 1,
    name: "My Blog",
    url: "https://myblog.com",
    status: "active",
    lastMetric: { lcp: 1.2, fid: 50, cls: 0.05 },
  },
];
```

**Success Criteria:**

- Dashboard page displays correctly
- Mock sites render in cards
- Empty state shows when no sites
- Modal opens/closes on button click

---

#### Milestone 1.4: Site Details & Metrics Dashboard (Day 6-7)

**Commits:**

```
git commit -m "feat: create site details page with metric visualizations"
git commit -m "feat: add Recharts for Core Web Vitals charts"
git commit -m "feat: implement metric cards with status indicators"
git commit -m "feat: add time range selector (24h, 7d, 30d)"
git commit -m "feat: add metric filters (device type, browser)"
```

**Deliverables:**

- ✅ Site details page with drill-down analytics
- ✅ Recharts visualizations for LCP, FID, CLS
- ✅ Metric value cards with trend indicators
- ✅ Time range selector
- ✅ Device/Browser filter UI

**Page Structure:**

```
app/dashboard/[siteId]/
├── page.tsx (main site details)
├── components/
│   ├── MetricsGrid.tsx
│   ├── LCPChart.tsx
│   ├── FIDChart.tsx
│   ├── CLSChart.tsx
│   ├── MetricCard.tsx
│   ├── TimeRangeSelector.tsx
│   └── FilterBar.tsx
```

**Charts to Implement:**

- Line chart for LCP over time
- Bar chart for FID distribution
- Area chart for CLS progression
- Device/Browser breakdown pie chart

**Success Criteria:**

- Charts render with mock data
- Time range selector updates charts
- Filters update displayed data
- Page is fully responsive

---

### WEEK 2: Authentication, Settings & Integration Prep

**Duration:** 7 Days (Dec 21 - Dec 27, 2025)

#### Milestone 2.1: Authentication Pages (Day 1-2)

**Commits:**

```
git commit -m "feat: create login page with form validation"
git commit -m "feat: create signup page with email validation"
git commit -m "feat: add password reset flow"
git commit -m "feat: implement middleware for route protection"
```

**Deliverables:**

- ✅ Login page with email/password form
- ✅ Signup page with validation
- ✅ Forgot password page
- ✅ Route protection middleware
- ✅ Session state management (Redux)

**Pages to Create:**

```
app/auth/
├── login/page.tsx
├── signup/page.tsx
├── forgot-password/page.tsx
├── reset-password/page.tsx
└── components/
    ├── LoginForm.tsx
    ├── SignupForm.tsx
    └── PasswordResetForm.tsx
```

**Form Validation:**

- Use Zod for schema validation
- Client-side validation with error messages
- Backend validation prep (no backend yet)

**Success Criteria:**

- Forms validate input correctly
- Error messages display
- Forms submit without errors (mock submission)
- Protected routes redirect to login

---

#### Milestone 2.2: Settings Pages (Day 3-4)

**Commits:**

```
git commit -m "feat: create user settings page"
git commit -m "feat: add profile management section"
git commit -m "feat: implement API key generation UI"
git commit -m "feat: create API key management panel"
```

**Deliverables:**

- ✅ User profile settings
- ✅ Account preferences
- ✅ API key management UI
- ✅ Notification preferences

**Pages to Create:**

```
app/dashboard/settings/
├── page.tsx
├── account/page.tsx
├── api-keys/page.tsx
├── notifications/page.tsx
└── components/
    ├── ProfileForm.tsx
    ├── ApiKeyManager.tsx
    └── PreferencesForm.tsx
```

**Success Criteria:**

- Settings pages render correctly
- Forms handle input (mock submission)
- API key manager UI works
- Data persists in localStorage

---

#### Milestone 2.3: Alerts Configuration Page (Day 5-6)

**Commits:**

```
git commit -m "feat: create alerts configuration page"
git commit -m "feat: add alert rule builder UI"
git commit -m "feat: implement metric threshold selector"
git commit -m "feat: add device/browser specific alerts"
git commit -m "feat: create alert history table"
```

**Deliverables:**

- ✅ Alert rules management page
- ✅ Alert rule builder form
- ✅ Threshold configuration UI
- ✅ Alert history timeline
- ✅ Delete/Edit alert rules

**Pages to Create:**

```
app/dashboard/alerts/
├── page.tsx
├── components/
│   ├── AlertRuleBuilder.tsx
│   ├── ThresholdSelector.tsx
│   ├── AlertRulesTable.tsx
│   ├── AlertHistoryTimeline.tsx
│   └── AlertDetailModal.tsx
```

**Success Criteria:**

- Alert rule form submits without error
- Rules display in table
- Can edit/delete rules (UI only)
- Alert history shows mock data

---

#### Milestone 2.4: Billing & Pricing Page (Day 7)

**Commits:**

```
git commit -m "feat: create pricing page with feature comparison"
git commit -m "feat: add pricing table and plans"
git commit -m "feat: implement billing status dashboard"
git commit -m "feat: add upgrade/downgrade UI buttons"
```

**Deliverables:**

- ✅ Pricing plans page (public)
- ✅ Billing dashboard
- ✅ Payment method management (UI only)
- ✅ Invoice history table

**Success Criteria:**

- Pricing page renders correctly
- Feature comparison table is clear
- Billing dashboard shows mock data
- Payment buttons ready for integration

---

### WEEK 3: Backend API & Database

**Duration:** 7 Days (Dec 28 - Jan 3, 2026)

#### Milestone 3.1: Backend Setup & Authentication (Day 1-2)

**Commits:**

```
git commit -m "init: initialize Express.js backend with TypeScript"
git commit -m "setup: configure PostgreSQL connection with Prisma"
git commit -m "feat: implement user authentication with JWT"
git commit -m "feat: add bcrypt password hashing"
git commit -m "feat: create auth middleware and decorators"
```

**Deliverables:**

- ✅ Express.js server with TypeScript
- ✅ Prisma ORM configured
- ✅ PostgreSQL connection established
- ✅ JWT authentication system
- ✅ Password hashing with bcrypt

**Backend Structure:**

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   └── index.ts
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── services/
│   │   └── auth.service.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts (main server)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env.example
└── package.json
```

**Success Criteria:**

- Server runs on port 3000
- Can connect to PostgreSQL
- JWT token generation works
- Password hashing/verification works

---

#### Milestone 3.2: User & Site Management APIs (Day 3-4)

**Commits:**

```
git commit -m "feat: implement user registration endpoint"
git commit -m "feat: implement user login endpoint"
git commit -m "feat: create POST /api/sites endpoint"
git commit -m "feat: create GET /api/sites endpoint"
git commit -m "feat: create DELETE /api/sites/:id endpoint"
git commit -m "feat: add input validation with Zod"
```

**API Endpoints:**

**Auth Routes:**

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

**User Routes:**

```
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/users/account
POST   /api/users/change-password
```

**Site Routes:**

```
GET    /api/sites
POST   /api/sites
GET    /api/sites/:id
PUT    /api/sites/:id
DELETE /api/sites/:id
GET    /api/sites/:id/settings
```

**Request/Response Examples:**

```typescript
// POST /api/sites
interface CreateSiteRequest {
  name: string;
  url: string;
}

interface CreateSiteResponse {
  id: number;
  name: string;
  url: string;
  siteId: string; // Public tracking ID
  createdAt: string;
}
```

**Success Criteria:**

- All endpoints return correct HTTP status codes
- Input validation works
- Database records created/updated correctly
- Auth middleware blocks unauthorized requests

---

#### Milestone 3.3: Metrics Collection API (Day 5-6)

**Commits:**

```
git commit -m "feat: create POST /api/metrics endpoint"
git commit -m "feat: implement bulk metrics ingestion"
git commit -m "feat: add metrics aggregation logic"
git commit -m "feat: create GET /api/sites/:id/metrics endpoint"
git commit -m "feat: implement metric time-range filtering"
git commit -m "feat: add device/browser filtering"
```

**Metrics API Endpoints:**

```
POST   /api/metrics                    # Receive metrics from tracker
GET    /api/sites/:id/metrics          # Get historical metrics
GET    /api/sites/:id/metrics/summary  # Get aggregated stats
GET    /api/sites/:id/metrics/chart    # Get chart data
```

**Request/Response Examples:**

```typescript
// POST /api/metrics
interface MetricPayload {
  siteId: string; // Public site ID
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  deviceType?: string;
  browserName?: string;
  osName?: string;
  pageUrl?: string;
  connectionType?: string;
  timestamp: number; // Unix timestamp
}

// GET /api/sites/:id/metrics?range=24h&deviceType=mobile
interface MetricsResponse {
  metrics: Metric[];
  summary: {
    avgLcp: number;
    avgFid: number;
    avgCls: number;
    p95Lcp: number;
    p95Fid: number;
    count: number;
  };
}
```

**Success Criteria:**

- Metrics endpoint accepts POST requests
- Data stored correctly in PostgreSQL
- Filtering and aggregation work
- Time-range queries return correct data

---

#### Milestone 3.4: Alert Management APIs (Day 7)

**Commits:**

```
git commit -m "feat: create POST /api/alert-rules endpoint"
git commit -m "feat: implement alert rule validation"
git commit -m "feat: create GET /api/alert-rules endpoint"
git commit -m "feat: implement DELETE /api/alert-rules/:id"
git commit -m "feat: create alert evaluation logic"
git commit -m "feat: implement POST /api/alerts endpoint (create alert)"
```

**Alert API Endpoints:**

```
POST   /api/alert-rules
GET    /api/alert-rules
PUT    /api/alert-rules/:id
DELETE /api/alert-rules/:id

POST   /api/alerts
GET    /api/alerts
PATCH  /api/alerts/:id/acknowledge
PATCH  /api/alerts/:id/resolve
```

**Success Criteria:**

- Alert rules can be created/updated/deleted
- Alerts are generated when metrics trigger rules
- Email notifications prepared (not sent yet)

---

### WEEK 4: WebSockets, Tracking SDK, DevOps & Deployment

**Duration:** 7 Days (Jan 4 - Jan 10, 2026)

#### Milestone 4.1: WebSocket Real-Time Updates (Day 1-2)

**Commits:**

```
git commit -m "feat: integrate Socket.io for real-time metrics"
git commit -m "feat: implement room-based metric broadcasting"
git commit -m "feat: create metric event streaming"
git commit -m "feat: implement connection authentication"
git commit -m "feat: add reconnection handling with exponential backoff"
```

**WebSocket Events:**

```
Client → Server:
  - subscribe:site:{siteId}
  - unsubscribe:site:{siteId}
  - get:latest-metrics:{siteId}

Server → Client:
  - metric:received (new metric data)
  - alert:triggered (new alert)
  - alert:resolved (alert resolved)
  - metrics:update (batch update)
  - error (connection error)
```

**Implementation:**

```typescript
// WebSocket server setup
io.on("connection", (socket) => {
  socket.on("subscribe:site", (siteId) => {
    // Subscribe to site metrics room
    socket.join(`site:${siteId}`);
  });
});

// Broadcasting metrics
io.to(`site:${siteId}`).emit("metric:received", metricData);
```

**Success Criteria:**

- Real-time updates received in frontend dashboard
- Socket connection persists across page navigation
- Reconnection works automatically
- Data is delivered within 1 second of collection

---

#### Milestone 4.2: Tracking SDK Development (Day 3-4)

**Commits:**

```
git commit -m "feat: create vanilla JavaScript tracker.js SDK"
git commit -m "feat: implement Core Web Vitals collection"
git commit -m "feat: add Web Vitals API integration"
git commit -m "feat: implement metric payload generation"
git commit -m "feat: add tracker initialization and configuration"
git commit -m "feat: create SDK build process and minification"
```

**Tracker SDK Structure:**

```
tracker/
├── src/
│   ├── index.ts
│   ├── collector.ts        # Collects Web Vitals
│   ├── sender.ts           # Sends data to backend
│   ├── queue.ts            # Batch queue for metrics
│   ├── config.ts           # Configuration
│   └── utils.ts            # Helper functions
├── dist/
│   ├── tracker.js          # Unminified (dev)
│   └── tracker.min.js      # Minified (production)
├── package.json
└── webpack.config.js
```

**SDK Usage (End Result):**

```html
<!-- Users add this to their website -->
<script src="https://webvitals.io/tracker.js?siteId=xxxxx"></script>
```

**SDK Features:**

- Measure LCP, FID, CLS automatically
- Capture device/browser info
- Send metrics every 10 seconds
- Batch requests to reduce network overhead
- Handle offline mode (queue metrics locally)
- Track custom events

**Success Criteria:**

- SDK file size < 5KB gzipped
- Metrics collected accurately
- Data sent to backend correctly
- No console errors on websites using tracker

---

#### Milestone 4.3: Dockerization & CI/CD Setup (Day 5-6)

**Commits:**

```
git commit -m "build: create Dockerfile for backend"
git commit -m "build: create Dockerfile for frontend"
git commit -m "build: add docker-compose.yml for local development"
git commit -m "ci: setup GitHub Actions workflow for testing"
git commit -m "ci: add GitHub Actions deployment workflow"
git commit -m "ci: configure AWS ECR integration"
```

**Docker Configuration:**

**Dockerfile.backend:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Dockerfile.frontend:**

```dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/.next /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/webvitals
      REDIS_URL: redis://redis:6379

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    depends_on:
      - backend
```

**GitHub Actions Workflow (.github/workflows/deploy.yml):**

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm install
      - run: npm run lint
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t webvitals-backend:latest ./backend
          docker build -t webvitals-frontend:latest ./frontend
      - name: Push to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.AWS_ECR_URI }}
          docker tag webvitals-backend:latest ${{ secrets.AWS_ECR_URI }}/webvitals-backend:latest
          docker push ${{ secrets.AWS_ECR_URI }}/webvitals-backend:latest
      - name: Deploy to EC2
        run: |
          ssh -i ${{ secrets.AWS_EC2_KEY }} ec2-user@${{ secrets.AWS_EC2_INSTANCE }} \
            'cd /home/ec2-user/webvitals && docker-compose pull && docker-compose up -d'
```

**Success Criteria:**

- Docker images build successfully
- docker-compose up runs all services
- GitHub Actions workflow executes without errors
- Deployment to AWS EC2 works

---

#### Milestone 4.4: Frontend-Backend Integration (Day 7)

**Commits:**

```
git commit -m "feat: connect frontend to backend API"
git commit -m "feat: integrate authentication with backend"
git commit -m "feat: connect dashboard to real metric data"
git commit -m "feat: integrate WebSocket updates in dashboard"
git commit -m "feat: setup API client with axios and error handling"
git commit -m "test: add integration tests for frontend-backend"
```

**Integration Points:**

- Login → Backend auth
- Dashboard → Real metrics from API
- Add Site → POST to backend
- Delete Site → DELETE to backend
- Alert Rules → CRUD with backend
- Real-time updates → WebSocket connection

**API Client Setup:**

```typescript
// lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

**Success Criteria:**

- Frontend loads real data from backend
- Authentication persists across sessions
- Real-time updates work end-to-end
- Error handling displays user-friendly messages
- All API calls have proper error handling

---

## 5. GIT WORKFLOW & COMMIT STRUCTURE

### 5.1 Branch Strategy

```
main (production)
  ├── develop (staging/integration)
  │   ├── feature/auth-implementation
  │   ├── feature/dashboard-ui
  │   ├── feature/metrics-api
  │   └── feature/websocket-integration
  │
  └── hotfix/fix-critical-bug
```

### 5.2 Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting, linting)
- `refactor:` Refactoring without feature change
- `test:` Adding/updating tests
- `chore:` Build process, dependencies
- `ci:` CI/CD configuration
- `perf:` Performance improvements

**Examples:**

```
feat(auth): implement JWT token refresh logic

Adds automatic token refresh when token expires.
Implements refresh token rotation.

Fixes #123
```

```
fix(dashboard): correct LCP metric calculation

LCP was being calculated incorrectly when multiple
images loaded. Now uses PerformanceObserver correctly.

Closes #456
```

### 5.3 Pull Request Process

1. Create feature branch from `develop`
2. Make commits with clear messages
3. Push to GitHub
4. Create PR with description
5. Ensure CI passes
6. Request code review
7. Merge to develop
8. Periodically merge develop → main for releases

---

## 6. DEPLOYMENT STRATEGY

### 6.1 Environments

```
Development (Local)
  ↓
Staging (AWS Dev Instance)
  ↓
Production (AWS Production Instance)
```

### 6.2 Deployment Process

**Local Development:**

```bash
docker-compose up -d
# Access: http://localhost:3001
```

**Staging Deployment:**

```bash
git push origin feature-branch
# GitHub Actions runs tests
# Merge to develop
# GitHub Actions deploys to staging AWS instance
```

**Production Deployment:**

```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions runs full test suite
# Builds Docker images
# Pushes to AWS ECR
# Deploys to production EC2 instance
```

### 6.3 Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_metric_columns

# Apply migration to production
npx prisma migrate deploy --skip-generate
```

---

## 7. TESTING STRATEGY

### 7.1 Frontend Testing

**Unit Tests (Jest):**

```typescript
// components/__tests__/SiteCard.test.tsx
describe('SiteCard', () => {
  it('renders site name', () => {
    const site = { id: 1, name: 'My Site', url: 'https://example.com' };
    render(<SiteCard site={site} />);
    expect(screen.getByText('My Site')).toBeInTheDocument();
  });
});
```

**Integration Tests (React Testing Library):**

```typescript
describe('Dashboard Integration', () => {
  it('loads and displays sites', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Site 1')).toBeInTheDocument();
    });
  });
});
```

### 7.2 Backend Testing

**API Tests (Supertest + Jest):**

```typescript
describe("POST /api/sites", () => {
  it("creates a new site", async () => {
    const response = await request(app)
      .post("/api/sites")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Site", url: "https://test.com" })
      .expect(201);

    expect(response.body.id).toBeDefined();
  });
});
```

### 7.3 Test Coverage Goals

- Frontend: 70%+ coverage
- Backend: 80%+ coverage
- Critical paths: 100% coverage

---

## 8. PERFORMANCE TARGETS

### 8.1 Frontend Performance

- Lighthouse Score: 90+
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Bundle size: < 150KB (gzipped)

### 8.2 Backend Performance

- API response time: < 200ms (p95)
- WebSocket latency: < 100ms
- Database query time: < 100ms
- Throughput: 1,000 metrics/second

### 8.3 Monitoring

- Set up CloudWatch dashboards
- Configure alerts for performance regressions
- Monitor error rates
- Track API response times

---

## 9. SECURITY REQUIREMENTS

### 9.1 Authentication & Authorization

- ✅ JWT tokens with 1-hour expiration
- ✅ Refresh tokens with 7-day expiration
- ✅ Password hashing with bcrypt (cost factor: 12)
- ✅ Rate limiting on auth endpoints
- ✅ CSRF protection on forms

### 9.2 Data Protection

- ✅ HTTPS/TLS encryption in transit
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React sanitization)
- ✅ CORS configuration
- ✅ Secure cookie settings (httpOnly, sameSite)

### 9.3 API Security

- ✅ API key validation for tracker
- ✅ Rate limiting: 1,000 req/min per IP
- ✅ Input validation with Zod
- ✅ Request size limits
- ✅ DDOS protection (Cloudflare)

---

## 10. MONITORING & LOGGING

### 10.1 Logging Strategy

**Frontend:**

```typescript
// Configure browser logging
console.log("[METRICS]", metricData);
console.error("[API_ERROR]", error);
```

**Backend:**

```typescript
// Configure Winston logger
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

logger.info("Server started on port 3000");
logger.error("Database connection failed", error);
```

### 10.2 Metrics & Monitoring

- **CloudWatch:** Monitor EC2 CPU, Memory, Disk
- **Application Metrics:** Track API response times, error rates
- **Business Metrics:** Track active users, metrics ingested, alerts triggered
- **Database:** Query performance, connection pool

### 10.3 Alerting

- Alert when error rate > 5%
- Alert when API response time > 500ms
- Alert when database connection fails
- Alert when disk space < 10%

---

## 11. DOCUMENTATION

### 11.1 README Files

- **Main README:** Project overview, setup instructions, architecture
- **Backend README:** API documentation, environment variables
- **Frontend README:** Component structure, development guide
- **Tracker README:** SDK usage instructions, customization options

### 11.2 API Documentation

- OpenAPI/Swagger specification
- Postman collection
- API endpoint reference
- Webhook documentation

### 11.3 Developer Guide

- Architecture overview
- Database schema documentation
- Component hierarchy diagram
- Deployment guide

---

## 12. SUCCESS CRITERIA & LAUNCH CHECKLIST

### 12.1 Pre-Launch Checklist

- [ ] All unit tests pass (frontend + backend)
- [ ] Integration tests pass
- [ ] Performance targets met (Lighthouse 90+, API < 200ms)
- [ ] Security audit completed
- [ ] Database backups configured
- [ ] Error monitoring (Sentry) configured
- [ ] CDN configured for static assets
- [ ] SSL certificate installed
- [ ] Email notifications configured
- [ ] Documentation complete
- [ ] Privacy policy written
- [ ] Terms of service written

### 12.2 Launch Metrics

- **Week 1:** 10 beta users
- **Week 2:** 20 beta users
- **Week 4:** 50 users registered
- **Month 2:** 100+ users, 10+ paying customers
- **Month 3:** 500+ users, $500+/month MRR

### 12.3 Post-Launch Tasks

1. Set up analytics (Mixpanel/Amplitude)
2. Create product roadmap based on user feedback
3. Build community (Twitter, Product Hunt, Dev.to)
4. Start content marketing (blog posts, tutorials)
5. Refine pricing based on user feedback

---

## 13. ROLLBACK PLAN

### 13.1 If Critical Bug in Production

```bash
# 1. Identify issue
# 2. Revert to previous version
git revert <commit-hash>
git push origin main

# 3. GitHub Actions deploys previous version
# 4. Database migrations reversed if needed
npx prisma migrate resolve --rolled-back <migration-name>

# 5. Communicate status to users
```

### 13.2 Database Rollback

```bash
# If migration fails in production
npx prisma migrate resolve --rolled-back <migration-name>

# Restore from backup
aws rds restore-db-instance-from-db-snapshot ...
```

---

## 14. FUTURE ROADMAP (Post-MVP)

### Phase 2 (Month 2-3)

- [ ] Email alert notifications
- [ ] Slack integration
- [ ] Advanced analytics (anomaly detection)
- [ ] Custom dashboards
- [ ] Export reports (PDF/CSV)

### Phase 3 (Month 4-6)

- [ ] GitHub integration
- [ ] Zapier integration
- [ ] Mobile app (React Native)
- [ ] API rate limiting per tier
- [ ] Custom branding (white-label)

### Phase 4 (Month 6+)

- [ ] AI-powered insights
- [ ] Predictive alerts
- [ ] Team collaboration features
- [ ] Enterprise SSO
- [ ] On-premise deployment option

---

## 15. RISK MITIGATION

### 15.1 Technical Risks

| Risk                         | Probability | Impact   | Mitigation                                      |
| ---------------------------- | ----------- | -------- | ----------------------------------------------- |
| Database scaling issues      | Medium      | High     | Use RDS read replicas, implement caching        |
| WebSocket disconnections     | Medium      | Medium   | Implement reconnection with backoff             |
| SDK conflicts with site code | Low         | Medium   | Use unique namespace, version isolation         |
| Data loss                    | Very Low    | Critical | Daily automated backups, disaster recovery plan |

### 15.2 Business Risks

| Risk                      | Probability | Impact | Mitigation                                           |
| ------------------------- | ----------- | ------ | ---------------------------------------------------- |
| Competitive pressure      | High        | Medium | Focus on developer experience, community             |
| User acquisition          | Medium      | High   | Content marketing, partnerships, referrals           |
| Churn rate > 10%          | Medium      | High   | Improve product based on feedback, support           |
| Payment processing issues | Low         | High   | Use Stripe for reliability, multiple payment methods |

---

## 16. CONCLUSION

This PRD provides a comprehensive roadmap for building WebVitals.io over 4 weeks. The project showcases full-stack expertise (frontend, backend, DevOps, performance optimization) and can be monetized immediately.

**Key Deliverables:**

1. ✅ Production-ready SaaS product
2. ✅ Portfolio piece for freelance clients
3. ✅ Potential revenue stream
4. ✅ GitHub stars and community interest
5. ✅ Justification for $40+/hour rates

**Next Steps:**

1. Review and finalize PRD with team
2. Set up Git repository and CI/CD
3. Allocate resources and timeline
4. Begin Milestone 1.1 immediately
5. Track progress with weekly check-ins

---

**Document Version:** 1.0
**Last Updated:** December 14, 2025
**Next Review:** January 11, 2026 (Launch Date)
