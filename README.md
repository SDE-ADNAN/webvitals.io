# WebVitals.io - Real-Time Web Performance Monitoring SaaS

**A lightweight, real-time web performance monitoring SaaS that enables indie developers, freelancers, and small agencies to track Core Web Vitals without the enterprise overhead.**

## 🚀 Project Overview

WebVitals.io is a full-stack SaaS application built to provide real-time monitoring of Core Web Vitals (LCP, FID, CLS) and other performance metrics. The platform offers a beautiful dashboard, real-time metric streaming via WebSockets, and zero-configuration tracking SDK.

### Key Features

- **Real-time Metrics**: Live Core Web Vitals tracking via WebSockets
- **Zero Configuration**: Single script tag to embed
- **Beautiful Dashboard**: Developer-focused UI built with Next.js and Tailwind CSS
- **Cost-Effective**: 50-70% cheaper than enterprise alternatives
- **Open Source SDK**: Full transparency and community contributions

## 📋 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, SSR, SSG)
- **UI Library**: React 19
- **Language**: TypeScript 5.6+
- **State Management**: Redux Toolkit
- **Data Visualization**: Recharts
- **Styling**: Tailwind CSS 3.4+
- **Real-time**: Socket.io-client
- **Server State**: TanStack Query (React Query) v5
- **Validation**: Zod
- **HTTP Client**: Axios

### Backend (Coming in Week 3)
- Node.js 20 (LTS)
- Express.js 4.x
- Prisma ORM
- PostgreSQL 15
- Redis
- Socket.io (WebSocket)
- Bull Queue
- JWT Authentication

### DevOps & Infrastructure
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS EC2, RDS, S3
- Nginx (Reverse Proxy)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND DASHBOARD (Next.js)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Dashboard Page (Real-time metrics)               │  │
│  │  Site Details Page (Drill-down analytics)         │  │
│  │  Alerts Configuration Page                        │  │
│  │  Settings & Billing Page                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ (HTTPS GET)
┌─────────────────────────────────────────────────────────┐
│          BACKEND API (Node.js + Express)                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │  API Server (Port 3000)                          │  │
│  │  WebSocket Server (Socket.io)                    │  │
│  │  Job Queue (Bull Queue)                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ (TCP Connection)
┌─────────────────────────────────────────────────────────┐
│         DATABASE (PostgreSQL + Redis)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  PostgreSQL (AWS RDS)                             │  │
│  │  Redis (Caching & Queue)                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
webvitals-saas/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/        # Marketing pages (landing, pricing)
│   ├── (app)/              # Protected app pages
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── settings/       # Settings pages
│   │   └── alerts/         # Alerts configuration
│   ├── auth/               # Authentication pages
│   ├── api/                # API routes (if needed)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── src/                    # Source code (future structure)
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── Layout/         # Layout components
│   ├── lib/                # Utilities and helpers
│   ├── server/             # Server-side code
│   ├── config/             # Configuration files
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── docs/                   # Documentation
│   └── PRD.md             # Product Requirements Document
├── .github/                # GitHub workflows
│   └── workflows/          # CI/CD pipelines
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SDE-ADNAN/webvitals.io.git
   cd webvitals-saas
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking

## 🧪 Testing

```bash
# Run linting
pnpm lint

# Check formatting
pnpm format:check

# Type check
pnpm type-check
```

## 📅 Development Timeline

### Week 1: Frontend Dashboard & Infrastructure Setup ✅
- [x] Project Scaffolding & Git Setup
- [ ] Layout & Navigation Components
- [ ] Dashboard Landing Page
- [ ] Site Details & Metrics Dashboard

### Week 2: Authentication, Settings & Integration Prep
- [ ] Authentication Pages
- [ ] Settings Pages
- [ ] Alerts Configuration Page
- [ ] Billing & Pricing Page

### Week 3: Backend API & Database
- [ ] Backend Setup & Authentication
- [ ] User & Site Management APIs
- [ ] Metrics Collection API
- [ ] Alert Management APIs

### Week 4: WebSockets, Tracking SDK, DevOps & Deployment
- [ ] WebSocket Real-Time Updates
- [ ] Tracking SDK Development
- [ ] Dockerization & CI/CD Setup
- [ ] Frontend-Backend Integration

## 🔒 Security

- JWT tokens with expiration
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CSRF protection
- HTTPS/TLS encryption
- Input validation with Zod
- SQL injection prevention (Prisma ORM)

## 📊 Performance Targets

### Frontend
- Lighthouse Score: 90+
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Bundle size: < 150KB (gzipped)

### Backend
- API response time: < 200ms (p95)
- WebSocket latency: < 100ms
- Database query time: < 100ms
- Throughput: 1,000 metrics/second

## 🤝 Contributing

This project follows conventional commits. See [PRD.md](./docs/PRD.md) for detailed development guidelines.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**Adnan Khan (SDE-ADNAN)**
- GitHub: [@SDE-ADNAN](https://github.com/SDE-ADNAN)

## 🎯 Roadmap

See [PRD.md](./docs/PRD.md) for the complete product roadmap and future features.

---

**Status**: 🚧 In Development (Milestone 1.1 Complete)

**Target Release**: January 11, 2026

