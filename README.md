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

- **Framework**: Next.js 15.0+ (App Router, React Server Components)
- **UI Library**: React 19.0+
- **Language**: TypeScript 5.6+ (strict mode enabled)
- **State Management**:
  - Redux Toolkit 2.0+ (client state: theme, user, UI)
  - React Query 5.0+ (server state: sites, metrics, alerts)
- **Data Visualization**: Recharts 2.10+
- **Styling**: Tailwind CSS 3.4+
- **Form Handling**: React Hook Form 7.49+ with Zod 3.22+ validation
- **HTTP Client**: Axios 1.6+
- **Real-time**: Socket.io-client 4.7+
- **Utilities**: lodash-es, date-fns, clsx, tailwind-merge

### Backend (Coming in Week 3)

- Node.js 20 (LTS)
- Express.js 4.x
- Prisma ORM
- PostgreSQL 15
- Redis
- Socket.io (WebSocket)
- Bull Queue
- JWT Authentication

### Development Tools

- **Linting**: ESLint 8.56+ with TypeScript and React plugins
- **Formatting**: Prettier 3.1+
- **Testing**: Jest 29.7+ and React Testing Library 14.1+ (coming soon)
- **CI/CD**: GitHub Actions

### DevOps & Infrastructure

- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS EC2, RDS, S3
- Nginx (Reverse Proxy)

## 🏗️ Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Pages (app/)                                         │  │
│  │  - layout.tsx (root layout)                          │  │
│  │  - page.tsx (landing/marketing)                      │  │
│  │  - dashboard/page.tsx (main dashboard)               │  │
│  │  - dashboard/[siteId]/page.tsx (site details)       │  │
│  │  - auth/login/page.tsx                               │  │
│  │  - auth/signup/page.tsx                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Layout     │  │  Dashboard   │  │   Charts     │     │
│  │  Components  │  │  Components  │  │  Components  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    State Management                          │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Redux Toolkit   │         │   React Query    │         │
│  │  (Client State)  │         │  (Server State)  │         │
│  │  - theme         │         │  - sites         │         │
│  │  - user          │         │  - metrics       │         │
│  │  - ui            │         │  - alerts        │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Week 1)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mock Data Services (lib/mock-data/)                 │  │
│  │  - mockSites.ts                                      │  │
│  │  - mockMetrics.ts                                    │  │
│  │  - mockAlerts.ts                                     │  │
│  │  (Structured to match future API responses)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

                    ↓ (Week 3: Replace with real API)

┌─────────────────────────────────────────────────────────────┐
│          BACKEND API (Node.js + Express)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Server (Port 3000)                              │  │
│  │  WebSocket Server (Socket.io)                        │  │
│  │  Job Queue (Bull Queue)                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         DATABASE (PostgreSQL + Redis)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (AWS RDS)                                 │  │
│  │  Redis (Caching & Queue)                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture Principles

- **Component-based architecture** with clear separation of concerns
- **Type-safe development** using TypeScript throughout
- **Responsive design** supporting mobile, tablet, and desktop
- **Accessibility-first** approach following WCAG 2.1 AA standards
- **Performance-optimized** with code splitting and lazy loading
- **Mock data structured** to match future API responses exactly

### Monorepo Architecture (Planned - Task 1.7)

The project will migrate to a **Turborepo monorepo** structure to support:

- **Multi-platform deployment**: Web (Next.js), Mobile (React Native), API (Express.js)
- **Code sharing**: Shared types, utilities, and UI components across all platforms
- **Independent deployments**: Each app can be deployed separately
- **Unified tooling**: Consistent linting, formatting, and testing
- **Build optimization**: Turborepo caching for faster builds

**Workspace Structure:**
- `apps/web` - Next.js frontend dashboard
- `apps/api` - Express.js backend API (separate from Next.js for independent deployment)
- `apps/mobile` - React Native app for iOS/Android
- `packages/types` - Shared TypeScript types
- `packages/ui` - Shared UI components
- `packages/utils` - Shared utility functions
- `packages/config` - Shared configuration files

## 📁 Project Structure

### Current Structure (Week 1)
```
webvitals-dashboard/
├── app/                          # Next.js App Router pages
│   ├── components/               # React components
│   │   ├── Layout/              # Layout components (Sidebar, Header, etc.)
│   │   ├── Dashboard/           # Dashboard-specific components
│   │   ├── SiteDetails/         # Site details page components
│   │   ├── Charts/              # Chart components (LCP, FID, CLS)
│   │   ├── Auth/                # Authentication forms
│   │   ├── Theme/               # Theme toggle component
│   │   └── UI/                  # Reusable UI components (Button, Modal, etc.)
│   ├── dashboard/               # Dashboard pages
│   │   ├── [siteId]/           # Dynamic site details page
│   │   ├── layout.tsx          # Dashboard layout
│   │   └── page.tsx            # Dashboard overview
│   ├── auth/                    # Authentication pages
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── api/                     # API routes (optional)
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing/marketing page
│   └── globals.css              # Global styles
├── lib/                         # Utilities and libraries
│   ├── redux/                   # Redux Toolkit setup
│   ├── react-query/            # React Query setup
│   ├── mock-data/              # Mock data for development
│   ├── api/                    # API client
│   ├── utils/                  # Utility functions
│   ├── validations/            # Validation schemas
│   └── config/                 # Configuration
├── types/                       # TypeScript type definitions
├── public/                      # Static assets
├── docs/                        # Documentation
├── .kiro/                       # Kiro specs and configuration
├── .github/                     # GitHub workflows
└── ...config files
```

### Future Monorepo Structure (Task 1.7+)
```
webvitals-monorepo/
├── apps/
│   ├── web/                     # Next.js frontend dashboard
│   │   ├── app/                # Next.js App Router pages
│   │   ├── lib/                # Web-specific utilities
│   │   ├── public/             # Static assets
│   │   └── package.json        # Web app dependencies
│   │
│   ├── api/                     # Express.js backend API (separate deployment)
│   │   ├── src/
│   │   │   ├── routes/        # API routes
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── services/      # Business logic
│   │   │   ├── middleware/    # Express middleware
│   │   │   └── server.ts      # Express server entry
│   │   └── package.json        # API dependencies
│   │
│   └── mobile/                  # React Native app (iOS/Android)
│       ├── src/
│       │   ├── screens/       # Mobile screens
│       │   ├── components/    # Mobile components
│       │   └── navigation/    # Navigation setup
│       └── package.json        # Mobile app dependencies
│
├── packages/
│   ├── types/                   # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── site.ts
│   │   │   ├── metric.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                      # Shared UI components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── utils/                   # Shared utility functions
│   │   ├── src/
│   │   │   ├── metrics.ts
│   │   │   ├── formatters.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                  # Shared configuration
│       ├── eslint/             # ESLint configs
│       ├── typescript/         # TypeScript configs
│       ├── tailwind/           # Tailwind configs
│       └── package.json
│
├── turbo.json                   # Turborepo pipeline configuration
├── package.json                 # Root package.json with workspaces
├── pnpm-workspace.yaml         # PNPM workspace configuration
└── README.md                    # This file
```

**Benefits of Monorepo Structure:**
- **Code Sharing**: Share types, utilities, and UI components across web, mobile, and API
- **Independent Deployment**: Deploy web, API, and mobile apps separately
- **Consistent Tooling**: Unified linting, formatting, and testing across all projects
- **Faster Development**: Turborepo caching speeds up builds and tests
- **Type Safety**: Shared types ensure consistency across platforms
- **Scalability**: Easy to add new apps (admin panel, marketing site, etc.)

## 🚦 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** (LTS version recommended)
  - Check version: `node --version`
  - Download: [https://nodejs.org/](https://nodejs.org/)
- **npm** (comes with Node.js) or **pnpm** (recommended for faster installs)
  - Check npm version: `npm --version`
  - Install pnpm: `npm install -g pnpm`
- **Git** for version control
  - Check version: `git --version`
  - Download: [https://git-scm.com/](https://git-scm.com/)

### Installation

Follow these steps to set up the project locally:

#### 1. Clone the repository

```bash
git clone https://github.com/SDE-ADNAN/webvitals.io.git
cd webvitals-dashboard
```

#### 2. Install dependencies

Using npm:

```bash
npm install
```

Or using pnpm (faster):

```bash
pnpm install
```

#### 3. Set up environment variables

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration. For Week 1 development, the default values should work:

```env
# API Configuration (Week 3)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=true

# AWS Configuration (Week 4)
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
```

#### 4. Run the development server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

#### 5. Verify the setup

Open your browser and navigate to:

- **Landing page**: [http://localhost:3000](http://localhost:3000)
- **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

You should see the dashboard with mock data displaying sample sites and metrics.

### Available Commands

#### Development

```bash
npm run dev          # Start development server (with hot reload)
npm run build        # Build for production
npm run start        # Start production server
```

#### Code Quality

```bash
npm run lint         # Run ESLint to check for code issues
npm run format       # Format all files with Prettier
npm run format:check # Check if files are formatted correctly
npm run type-check   # Run TypeScript compiler to check types
```

#### Testing (Coming Soon)

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Quick Start for Development

After installation, you can start developing immediately:

1. **Start the dev server**: `npm run dev`
2. **Make changes** to files in `app/` or `lib/`
3. **See changes instantly** - Next.js hot reloads automatically
4. **Check for errors**: `npm run lint && npm run type-check`
5. **Format code**: `npm run format`

## 🧪 Testing & Quality Assurance

### Linting

Check for code quality issues:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

### Code Formatting

Check if code is properly formatted:

```bash
npm run format:check
```

Format all files:

```bash
npm run format
```

### Type Checking

Verify TypeScript types without emitting files:

```bash
npm run type-check
```

### Running All Checks

Before committing, run all quality checks:

```bash
npm run lint && npm run format:check && npm run type-check && npm run build
```

## 🎯 Key Dependencies

### Production Dependencies

| Package               | Version  | Purpose                         |
| --------------------- | -------- | ------------------------------- |
| next                  | ^15.0.0  | React framework with App Router |
| react                 | ^19.0.0  | UI library                      |
| react-dom             | ^19.0.0  | React DOM renderer              |
| typescript            | ^5.6.0   | Type-safe JavaScript            |
| @reduxjs/toolkit      | ^2.11.1  | State management                |
| react-redux           | ^9.2.0   | React bindings for Redux        |
| redux-persist         | ^6.0.0   | Persist Redux state             |
| @tanstack/react-query | ^5.90.12 | Server state management         |
| axios                 | ^1.13.2  | HTTP client                     |
| recharts              | ^2.15.4  | Chart library                   |
| react-hook-form       | ^7.68.0  | Form handling                   |
| zod                   | ^3.25.76 | Schema validation               |
| tailwindcss           | ^3.4.0   | Utility-first CSS               |
| lucide-react          | ^0.561.0 | Icon library                    |
| date-fns              | ^4.1.0   | Date utilities                  |
| clsx                  | ^2.1.1   | Conditional classnames          |
| tailwind-merge        | ^3.4.0   | Merge Tailwind classes          |

### Development Dependencies

| Package      | Version | Purpose                  |
| ------------ | ------- | ------------------------ |
| eslint       | ^8      | Code linting             |
| prettier     | ^3.1.0  | Code formatting          |
| @types/node  | ^20     | Node.js type definitions |
| @types/react | ^19     | React type definitions   |
| tsx          | ^4.21.0 | TypeScript execution     |

## 📅 Development Timeline

### Week 1: Frontend Dashboard & Infrastructure Setup (Current)

- [x] 1.1: Project Scaffolding & Configuration
  - [x] Initialize Next.js 15 with TypeScript and Tailwind
  - [x] Configure ESLint and Prettier
  - [x] Install core dependencies
  - [x] Create environment configuration
  - [x] Configure Git repository
  - [x] Set up GitHub Actions CI/CD
  - [ ] Create project documentation
- [ ] 1.2: Core Infrastructure & State Management
- [ ] 1.3: Mock Data & Utilities
- [ ] 1.4: API Client & React Query Hooks
- [ ] 1.5: Base UI Components
- [ ] 1.6: Layout Components
- [ ] 1.7: Dashboard Overview Page
- [ ] 1.8-1.10: Site Details Page
- [ ] 1.11: Authentication Pages
- [ ] 1.12-1.14: Testing, Optimization & Polish

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

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env.local` and configure:

```env
# API Configuration (Week 3+)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=true  # Set to false when backend is ready

# AWS Configuration (Week 4+)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### TypeScript Configuration

The project uses strict TypeScript configuration (`tsconfig.json`):

- Strict mode enabled
- No implicit any
- Strict null checks
- Path aliases configured (`@/` for root)

### Tailwind Configuration

Custom Tailwind configuration in `tailwind.config.ts`:

- Custom color palette
- Dark mode support (class-based)
- Custom breakpoints for responsive design
- Extended spacing and typography

## 🔒 Security

### Current Implementation (Week 1)

- Input validation with Zod schemas
- TypeScript strict mode for type safety
- Environment variable validation
- Secure client-side state management

### Planned (Week 3+)

- JWT tokens with expiration
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CSRF protection
- HTTPS/TLS encryption
- SQL injection prevention (Prisma ORM)
- XSS protection

## 📊 Performance Targets

### Frontend

- **Lighthouse Score**: 90+ (Performance)
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Bundle size**: < 150KB (gzipped, initial load)
- **Time to Interactive**: < 3.5s

### Backend (Week 3+)

- **API response time**: < 200ms (p95)
- **WebSocket latency**: < 100ms
- **Database query time**: < 100ms
- **Throughput**: 1,000 metrics/second

## 🐛 Troubleshooting

### Common Issues

#### Port 3000 already in use

```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

#### Module not found errors

```bash
# Clear Next.js cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
```

#### TypeScript errors after pulling changes

```bash
# Regenerate TypeScript types
npm run type-check
```

#### Environment variables not loading

- Ensure `.env.local` exists (copy from `.env.example`)
- Restart the development server after changing env vars
- Check that variables start with `NEXT_PUBLIC_` for client-side access

#### Build fails

```bash
# Check for linting errors
npm run lint

# Check for type errors
npm run type-check

# Clear cache and rebuild
rm -rf .next
npm run build
```

### Getting Help

- **Documentation**: Check [docs/PRD.md](./docs/PRD.md) for detailed specifications
- **Issues**: Open an issue on GitHub with:
  - Clear description of the problem
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details (Node version, OS, etc.)
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🤝 Contributing

We welcome contributions to WebVitals.io! This project follows best practices for code quality and commit conventions.

### Development Workflow

1. **Fork the repository** and clone your fork
2. **Create a feature branch** from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the code style guidelines
4. **Test your changes**:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
5. **Commit your changes** using conventional commits (see below)
6. **Push to your fork** and create a Pull Request to the `develop` branch

### Code Style Guidelines

- **TypeScript**: Use strict mode, avoid `any` types
- **Components**: Use functional components with TypeScript interfaces
- **Naming**:
  - Components: PascalCase (`SiteCard.tsx`)
  - Files: camelCase for utilities (`metrics.ts`)
  - Variables: camelCase
  - Constants: UPPER_SNAKE_CASE
- **Formatting**: Code is automatically formatted with Prettier
- **Linting**: Follow ESLint rules (run `npm run lint`)

### Commit Message Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools
- **ci**: Changes to CI configuration files and scripts

#### Examples

```bash
feat(dashboard): add site overview grid component

Implements the SiteOverviewGrid component that displays all monitored
sites in a responsive grid layout.

Closes #123
```

```bash
fix(metrics): correct LCP threshold calculation

The LCP threshold was incorrectly using FID values. Updated to use
the correct METRIC_THRESHOLDS.lcp values.

Fixes #456
```

```bash
docs(readme): update installation instructions

Added detailed steps for environment variable setup and clarified
Node.js version requirements.
```

### Pull Request Guidelines

- **Title**: Use conventional commit format
- **Description**: Clearly describe what changes were made and why
- **Tests**: Ensure all tests pass and add new tests for new features
- **Documentation**: Update README or docs if needed
- **Small PRs**: Keep pull requests focused and reasonably sized
- **Review**: Be responsive to feedback and questions

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/\***: New features
- **fix/\***: Bug fixes
- **docs/\***: Documentation updates

### Code Review Process

1. All PRs require at least one approval
2. CI checks must pass (lint, type-check, build)
3. Code should follow project conventions
4. Changes should be well-tested

## 📚 Additional Resources

### Documentation

- **[Product Requirements Document (PRD)](./docs/PRD.md)**: Complete product specification
- **[Frontend Dashboard Spec](./.kiro/specs/frontend-dashboard/)**: Detailed requirements, design, and tasks
- **[Next.js Documentation](https://nextjs.org/docs)**: Next.js 15 App Router guide
- **[React Documentation](https://react.dev/)**: React 19 documentation
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**: TypeScript guide
- **[Tailwind CSS](https://tailwindcss.com/docs)**: Utility-first CSS framework
- **[Redux Toolkit](https://redux-toolkit.js.org/)**: State management
- **[React Query](https://tanstack.com/query/latest)**: Server state management

### Related Projects

- **Tracking SDK** (Coming in Week 4): JavaScript SDK for embedding in websites
- **Backend API** (Coming in Week 3): Node.js/Express API server
- **Infrastructure** (Coming in Week 4): Docker, AWS deployment configs

## 🎯 Roadmap

### Completed ✅

- Project scaffolding and configuration
- Development tooling (ESLint, Prettier, TypeScript)
- CI/CD pipeline with GitHub Actions
- Environment configuration
- Git repository structure
- Comprehensive project documentation

### In Progress 🚧

- **Monorepo/Turborepo migration** (Task 1.7 - Next Priority)
- Core infrastructure and state management
- Mock data and utilities
- Base UI components
- Layout components
- Dashboard pages

### Upcoming 📋

- **Multi-platform support** (iOS/Android via React Native)
- **Separate API deployment** (Express.js backend independent from Next.js)
- Authentication system
- Site management
- Real-time metrics visualization
- Alert configuration
- Backend API integration
- WebSocket real-time updates
- Tracking SDK
- Production deployment

See [PRD.md](./docs/PRD.md) for the complete product roadmap and future features.

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 👤 Author

**Adnan Khan (SDE-ADNAN)**

- GitHub: [@SDE-ADNAN](https://github.com/SDE-ADNAN)
- Project: [WebVitals.io](https://github.com/SDE-ADNAN/webvitals.io)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment tools
- Open source community for the excellent libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/SDE-ADNAN/webvitals.io/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SDE-ADNAN/webvitals.io/discussions)
- **Email**: Contact through GitHub profile

---

**Status**: 🚧 In Development (Milestone 1.1 Complete - 6/6 tasks done)

**Current Phase**: Week 1 - Frontend Dashboard Foundation

**Target Release**: January 11, 2026

**Last Updated**: December 15, 2025
