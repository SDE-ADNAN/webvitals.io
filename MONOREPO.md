# WebVitals.io Monorepo

This project uses **Turborepo** to manage a monorepo structure with multiple applications and shared packages.

## 📁 Workspace Structure

```
webvitals-monorepo/
├── apps/
│   ├── web/                     # Next.js 15 frontend dashboard
│   ├── api/                     # Express.js backend API (separate deployment)
│   └── mobile/                  # React Native app (placeholder for iOS/Android)
│
├── packages/
│   ├── types/                   # Shared TypeScript types
│   ├── ui/                      # Shared UI components
│   ├── utils/                   # Shared utility functions
│   └── config/                  # Shared configuration (ESLint, TypeScript, Tailwind)
│
├── turbo.json                   # Turborepo pipeline configuration
├── package.json                 # Root package.json with workspaces
└── README.md                    # Main project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Turbo CLI (installed globally or via npx)

### Installation

```bash
# Install all dependencies for all workspaces
npm install
```

## 📦 Workspaces

### Apps

#### `apps/web` - Next.js Frontend Dashboard

The main web application built with Next.js 15, React 19, and Tailwind CSS.

**Dependencies:**
- `@webvitals/types` - Shared types
- `@webvitals/utils` - Shared utilities
- Next.js, React, Redux Toolkit, React Query, etc.

**Commands:**
```bash
# Development
npm run dev              # Runs all apps including web
cd apps/web && npm run dev  # Run only web app

# Build
npm run build            # Builds all apps
cd apps/web && npm run build  # Build only web app

# Type check
npm run type-check
```

**Port:** 3000

---

#### `apps/api` - Express.js Backend API

Standalone Express.js API server (separate from Next.js for independent deployment).

**Dependencies:**
- `@webvitals/types` - Shared types
- Express.js

**Commands:**
```bash
# Development
npm run dev              # Runs all apps including API
cd apps/api && npm run dev  # Run only API server

# Build
npm run build
cd apps/api && npm run build

# Start production
cd apps/api && npm start
```

**Port:** 3001

**Status:** Placeholder with health check endpoint. Full implementation coming in Week 3.

---

#### `apps/mobile` - React Native App

Placeholder for future iOS and Android mobile applications.

**Status:** Not yet implemented. Reserved for future development.

---

### Packages

#### `packages/types` - Shared TypeScript Types

Shared type definitions used across all applications.

**Exports:**
- `Site` - Site interface
- `Metric`, `MetricSummary`, `MetricFilters` - Metric interfaces
- `User`, `AuthState` - User and authentication interfaces

**Usage:**
```typescript
import { Site, Metric, User } from '@webvitals/types';
```

---

#### `packages/ui` - Shared UI Components

Shared React components that can be used across web and mobile apps.

**Status:** Placeholder. Will be populated as components are extracted from apps/web.

**Planned exports:**
- Button, Card, Modal, Badge, Input, etc.

---

#### `packages/utils` - Shared Utility Functions

Shared utility functions used across applications.

**Status:** Placeholder. Will be populated as utilities are extracted from apps/web.

**Planned exports:**
- Metric calculation utilities
- Formatters
- Validation helpers

---

#### `packages/config` - Shared Configuration

Shared configuration files for ESLint, TypeScript, and Tailwind CSS.

**Exports:**
- `eslint-preset.js` - Shared ESLint configuration
- `tsconfig.json` - Base TypeScript configuration

---

## 🛠️ Commands

### Root Commands (Run from monorepo root)

```bash
# Development - Runs all apps in parallel
npm run dev

# Build - Builds all apps and packages
npm run build

# Lint - Lints all workspaces
npm run lint

# Type check - Type checks all workspaces
npm run type-check

# Format - Formats all files with Prettier
npm run format

# Format check - Checks if files are formatted
npm run format:check
```

### Workspace-Specific Commands

```bash
# Run command in specific workspace
npm run dev --workspace=@webvitals/web
npm run build --workspace=@webvitals/api

# Or navigate to workspace directory
cd apps/web
npm run dev
```

## 🔄 Turborepo Pipeline

The `turbo.json` file defines the task pipeline:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    }
  }
}
```

**Key features:**
- **Dependency ordering:** `^build` means "build dependencies first"
- **Caching:** Turbo caches build outputs for faster rebuilds
- **Parallel execution:** Tasks run in parallel when possible
- **Persistent tasks:** Dev servers run continuously

## 📝 Adding New Workspaces

### Adding a New App

1. Create directory: `apps/new-app/`
2. Create `package.json`:
```json
{
  "name": "@webvitals/new-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "...",
    "build": "...",
    "lint": "..."
  }
}
```
3. Add dependencies to shared packages:
```json
{
  "dependencies": {
    "@webvitals/types": "*",
    "@webvitals/utils": "*"
  }
}
```
4. Run `npm install` from root

### Adding a New Package

1. Create directory: `packages/new-package/`
2. Create `package.json`:
```json
{
  "name": "@webvitals/new-package",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```
3. Create `src/index.ts` with exports
4. Run `npm install` from root

## 🔗 Workspace Dependencies

Workspaces can depend on each other using the `*` version:

```json
{
  "dependencies": {
    "@webvitals/types": "*",
    "@webvitals/utils": "*"
  }
}
```

npm workspaces will automatically link these packages.

## 🚀 Deployment

### Independent Deployment

Each app can be deployed independently:

**Web App (Next.js):**
```bash
cd apps/web
npm run build
npm start
```

**API Server (Express):**
```bash
cd apps/api
npm run build
npm start
```

### Docker Deployment

Each app can have its own Dockerfile for containerized deployment:

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

## 🎯 Benefits of Monorepo

1. **Code Sharing:** Share types, utilities, and components across apps
2. **Consistent Tooling:** Same linting, formatting, and testing setup
3. **Atomic Changes:** Update shared code and all consumers in one commit
4. **Type Safety:** TypeScript types are shared and always in sync
5. **Faster Builds:** Turborepo caching speeds up builds significantly
6. **Independent Deployment:** Each app can be deployed separately
7. **Scalability:** Easy to add new apps (admin panel, marketing site, etc.)

## 📚 Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

## 🐛 Troubleshooting

### Workspace not found

```bash
# Reinstall dependencies
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Type errors in workspace dependencies

```bash
# Rebuild all packages
npm run build
```

### Turbo cache issues

```bash
# Clear Turbo cache
rm -rf .turbo
npm run build
```

### Port conflicts

If ports 3000 or 3001 are in use:

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or change ports in .env files
```

## 📊 Workspace Status

| Workspace | Status | Description |
|-----------|--------|-------------|
| `@webvitals/web` | ✅ Active | Next.js frontend dashboard |
| `@webvitals/api` | 🚧 Placeholder | Express.js API server |
| `@webvitals/mobile` | 📋 Planned | React Native mobile app |
| `@webvitals/types` | ✅ Active | Shared TypeScript types |
| `@webvitals/ui` | 📋 Planned | Shared UI components |
| `@webvitals/utils` | 📋 Planned | Shared utilities |
| `@webvitals/config` | ✅ Active | Shared configuration |

---

**Last Updated:** December 15, 2025
**Turborepo Version:** 2.6.3
**Node Version:** 20+
