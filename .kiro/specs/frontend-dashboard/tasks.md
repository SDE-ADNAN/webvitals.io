# Implementation Plan - Frontend Dashboard (Week 1)

This implementation plan breaks down the Week 1 Frontend Dashboard into actionable tasks that build incrementally. Each task references specific requirements and includes clear success criteria.

## Task Execution Guidelines

- Execute tasks in order (dependencies are managed)
- Each task should be completable in 1-4 hours
- Test after each major task completion
- All tasks are required for comprehensive implementation
- Property-based tests and unit tests are included for quality assurance

---

## Milestone 1.1: Project Scaffolding & Configuration

- [x] 1. Initialize Next.js 15 project with TypeScript and Tailwind CSS
  - Run `npx create-next-app@latest webvitals-dashboard --typescript --tailwind --app --no-src-dir`
  - Verify project structure uses App Router (app/ directory)
  - Confirm TypeScript strict mode is enabled in tsconfig.json
  - Test: `npm run dev` starts without errors
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.1 Configure ESLint and Prettier
  - Install Prettier: `npm install --save-dev prettier eslint-config-prettier`
  - Create `.prettierrc.json` with formatting rules
  - Create `.prettierignore` file
  - Update `.eslintrc.json` to extend prettier config
  - Add format scripts to package.json: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`
  - Test: `npm run lint` and `npm run format:check` pass
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 1.2 Install core dependencies
  - Install Redux: `npm install @reduxjs/toolkit react-redux redux-persist`
  - Install React Query: `npm install @tanstack/react-query @tanstack/react-query-devtools`
  - Install form libraries: `npm install react-hook-form zod @hookform/resolvers`
  - Install UI libraries: `npm install recharts lucide-react clsx tailwind-merge`
  - Install utilities: `npm install axios lodash-es date-fns`
  - Install dev dependencies: `npm install --save-dev @types/lodash-es`
  - Test: `npm install` completes without errors
  - _Requirements: 1.1, 21.1, 21.3_

- [x] 1.3 Create environment configuration
  - Create `.env.example` with all required variables (API_URL, WS_URL, USE_MOCK_DATA, AWS config)
  - Create `.env.local` from `.env.example` with development values
  - Add `.env.local` to `.gitignore`
  - Create `lib/config/env.ts` to validate and export environment variables
  - Test: Environment variables load correctly on app start
  - _Requirements: 17.1, 17.2, 17.3, 17.5_

- [x] 1.4 Configure Git repository
  - Initialize git: `git init`
  - Update `.gitignore` to exclude node_modules, .env files, .next, build artifacts
  - Create initial commit
  - Create `develop` branch: `git checkout -b develop`
  - Test: Verify .gitignore patterns work correctly
  - _Requirements: 18.1, 18.5_

- [x] 1.5 Set up GitHub Actions CI/CD workflow
  - Create `.github/workflows/ci.yml` for automated testing
  - Configure workflow to run on push and pull requests
  - Add steps: checkout, setup Node.js 20, install dependencies, lint, type-check, build
  - Test: Push to GitHub and verify workflow runs
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 1.6 Create project documentation
  - Create comprehensive `README.md` with project overview, architecture diagram, setup instructions
  - Include commands for dev, build, test, lint, format
  - Document tech stack and key dependencies
  - Add contribution guidelines and commit message conventions
  - Test: Follow README instructions in a fresh clone
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 1.7 Set up Turborepo monorepo structure
  - Install Turborepo: `npm install turbo --global` and `npx create-turbo@latest`
  - Create monorepo structure with the following workspaces:
    - `apps/web` - Next.js frontend dashboard (move current app here)
    - `apps/api` - Express.js backend API server (separate from Next.js)
    - `apps/mobile` - React Native app (placeholder for future iOS/Android)
    - `packages/ui` - Shared UI components library
    - `packages/types` - Shared TypeScript types and interfaces
    - `packages/config` - Shared configuration (ESLint, TypeScript, Tailwind)
    - `packages/utils` - Shared utility functions
  - Create root `turbo.json` with pipeline configuration
  - Update root `package.json` with workspace configuration
  - Move existing Next.js app to `apps/web` directory
  - Create `apps/api/package.json` for Express server
  - Create `packages/types/package.json` for shared types
  - Create `packages/config/package.json` for shared configs
  - Update all import paths to use workspace references
  - Configure build pipeline: `turbo run build`
  - Configure dev pipeline: `turbo run dev`
  - Test: `turbo run build` builds all workspaces successfully
  - Test: `turbo run dev` starts all dev servers
  - _Requirements: Project scalability, multi-platform support_

---

## Milestone 1.2: Core Infrastructure & State Management

- [ ] 2. Set up TypeScript types and interfaces
  - Create `packages/types/src/site.ts` with Site interface matching Prisma schema
  - Create `packages/types/src/metric.ts` with Metric and MetricSummary interfaces
  - Create `packages/types/src/user.ts` with User and AuthState interfaces
  - Create `packages/types/src/index.ts` to export all types
  - Configure package exports in `packages/types/package.json`
  - Test: Import types in web app without errors
  - _Requirements: 27.1_

- [ ] 2.1 Configure Redux Toolkit store
  - Create `lib/redux/store.ts` with configureStore
  - Install and configure redux-persist for theme and user slices
  - Create `lib/redux/hooks.ts` with typed useAppDispatch and useAppSelector
  - Create Redux provider component
  - Test: Store initializes without errors
  - _Requirements: 21.1, 21.2, 21.4_

- [ ] 2.2 Implement theme slice
  - Create `lib/redux/slices/themeSlice.ts`
  - Add state: `{ mode: 'light' | 'dark' }`
  - Add actions: toggleTheme(), setTheme(mode)
  - Add selectors: selectThemeMode
  - Configure persistence with redux-persist
  - Test: Theme state updates correctly
  - _Requirements: 5.1, 5.3_

- [ ] 2.3 Write property test for theme slice
  - **Property 5: Theme Toggle Functionality**
  - **Validates: Requirements 5.1**
  - Install fast-check: `npm install --save-dev fast-check`
  - Create `lib/redux/slices/themeSlice.property.test.ts`
  - Test that toggling theme always switches to opposite
  - Test that toggling twice returns to original state
  - Configure to run 100 iterations
  - _Requirements: 5.1_

- [ ] 2.4 Implement user slice
  - Create `lib/redux/slices/userSlice.ts`
  - Add state: `{ user, token, isAuthenticated, isLoading }`
  - Add actions: setUser(), setToken(), logout(), setLoading()
  - Add selectors: selectUser, selectIsAuthenticated
  - Configure persistence for token and user
  - Test: User state updates correctly
  - _Requirements: 24.1, 24.4_

- [ ] 2.5 Implement UI slice
  - Create `lib/redux/slices/uiSlice.ts`
  - Add state: `{ sidebarOpen, mobileMenuOpen, activeModal }`
  - Add actions: toggleSidebar(), toggleMobileMenu(), openModal(), closeModal()
  - Add selectors: selectSidebarOpen, selectActiveModal
  - Test: UI state updates correctly
  - _Requirements: 8.2, 8.5_

- [ ] 2.6 Configure React Query
  - Create `lib/react-query/queryClient.ts` with QueryClient configuration
  - Set staleTime: 1 minute, cacheTime: 5 minutes
  - Configure retry logic with exponential backoff
  - Create QueryClientProvider wrapper
  - Test: Query client initializes correctly
  - _Requirements: 21.3, 21.5_

- [ ] 2.7 Create root providers component
  - Create `app/providers.tsx` combining Redux and React Query providers
  - Wrap with PersistGate for redux-persist
  - Add React Query Devtools in development
  - Update `app/layout.tsx` to use Providers
  - Test: All providers work together without errors
  - _Requirements: 21.1, 21.3_

---

## Milestone 1.3: Mock Data & Utilities

- [ ] 3. Create mock data structure
  - Create `lib/mock-data/types.ts` with mock data interfaces
  - Create `lib/mock-data/mockSites.ts` with sample site data (2-3 sites)
  - Implement getMockSites() and getMockSite(siteId) with simulated delays
  - Test: Mock functions return data with correct structure
  - _Requirements: 16.1, 27.2, 27.4_

- [ ] 3.1 Create mock metrics generator
  - Create `lib/mock-data/mockMetrics.ts`
  - Implement generateMockMetrics(siteId, count) function
  - Generate realistic LCP (1000-6000ms), FID (50-450ms), CLS (0-0.4) values
  - Include varied deviceType, browserName, osName
  - Add timestamps for time-series data
  - Test: Generated metrics have all required properties
  - _Requirements: 16.2, 16.3, 16.4, 27.3_

- [ ] 3.2 Write property tests for mock data generation
  - **Property 41: Mock Metric Value Ranges**
  - **Property 42: Time-Series Data Timestamps**
  - **Property 43: Mock Data Variety**
  - **Validates: Requirements 16.2, 16.3, 16.4**
  - Create `lib/mock-data/mockMetrics.property.test.ts`
  - Test LCP values are within 1000-6000ms range
  - Test all metrics have timestamps
  - Test generated data includes multiple device types
  - Configure to run 100 iterations each
  - _Requirements: 16.2, 16.3, 16.4_

- [ ] 3.3 Implement metric utilities
  - Create `lib/utils/metrics.ts`
  - Define METRIC_THRESHOLDS constants (LCP, FID, CLS, TTFB, FCP)
  - Implement getMetricStatus(metricType, value) function
  - Implement getMetricColor(status) function for Tailwind classes
  - Test: Status classification works for all thresholds
  - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9_

- [ ] 3.4 Write property tests for metric classification
  - **Property 25: Good Metric Status Indicator**
  - **Property 26: Needs Improvement Metric Status Indicator**
  - **Property 27: Poor Metric Status Indicator**
  - **Validates: Requirements 12.2, 12.3, 12.4, 28.1-28.9**
  - Create `lib/utils/metrics.property.test.ts`
  - Test LCP values < 2500ms are classified as "good"
  - Test LCP values 2500-4000ms are "needs-improvement"
  - Test LCP values > 4000ms are "poor"
  - Repeat for FID and CLS with their thresholds
  - Configure to run 100 iterations each
  - _Requirements: 12.2, 12.3, 12.4, 28.1-28.9_

- [ ] 3.5 Create formatting utilities
  - Create `lib/utils/formatters.ts`
  - Implement formatMetricValue(value, unit) for display
  - Implement formatTimestamp(timestamp) for dates
  - Implement formatDuration(ms) for time ranges
  - Test: Formatters produce correct output
  - _Requirements: 12.1_

- [ ] 3.6 Create form validation schemas
  - Create `lib/validations/schemas.ts`
  - Define siteSchema with Zod (name: 3-50 chars, url: valid URL pattern)
  - Define loginSchema (email, password min 8 chars)
  - Define signupSchema (email, password with complexity, confirmPassword)
  - Export TypeScript types from schemas
  - Test: Schemas validate correctly
  - _Requirements: 23.1, 23.4, 23.5_

---

## Milestone 1.4: API Client & React Query Hooks

- [ ] 4. Set up Axios API client
  - Create `lib/api/client.ts` with Axios instance
  - Configure baseURL from environment variables
  - Add request interceptor to include auth token
  - Add response interceptor for 401 handling and network errors
  - Set 10-second timeout
  - Test: API client initializes correctly
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

- [ ] 4.1 Create React Query hooks for sites
  - Create `lib/react-query/queries/useSites.ts`
  - Implement useSites() hook calling getMockSites()
  - Implement useSite(siteId) hook calling getMockSite()
  - Configure query keys: ['sites'] and ['sites', siteId]
  - Test: Hooks return data correctly
  - _Requirements: 7.1, 10.1_

- [ ] 4.2 Create React Query hooks for metrics
  - Create `lib/react-query/queries/useMetrics.ts`
  - Implement useMetrics(siteId, filters) hook
  - Call getMockMetrics() with filters
  - Calculate summary statistics
  - Configure query key: ['metrics', siteId, filters]
  - Test: Hooks return filtered data correctly
  - _Requirements: 11.1, 13.2, 14.2, 14.3_

- [ ] 4.3 Create error boundary component
  - Create `app/components/UI/ErrorBoundary.tsx`
  - Implement componentDidCatch to log errors
  - Display fallback UI with retry button
  - Test: Error boundary catches and displays errors
  - _Requirements: 22.3_

- [ ] 4.4 Create skeleton loading components
  - Create `app/components/UI/Skeleton.tsx`
  - Implement CardSkeleton component
  - Implement ChartSkeleton component
  - Implement TableSkeleton component
  - Use Tailwind animate-pulse for loading effect
  - Test: Skeletons render correctly
  - _Requirements: 22.1_

---

## Milestone 1.5: Base UI Components

- [ ] 5. Create reusable Button component
  - Create `app/components/UI/Button.tsx`
  - Support variants: primary, secondary, outline, ghost
  - Support sizes: sm, md, lg
  - Include loading state with spinner
  - Add proper ARIA attributes and keyboard accessibility
  - Test: Button renders with all variants
  - _Requirements: 26.1_

- [ ] 5.1 Create reusable Input component
  - Create `app/components/UI/Input.tsx`
  - Support types: text, email, password, url
  - Include error state styling
  - Add proper label association
  - Include ARIA attributes for validation
  - Test: Input renders with error states
  - _Requirements: 23.2, 26.3_

- [ ] 5.2 Create Card component
  - Create `app/components/UI/Card.tsx`
  - Support hover effects
  - Include optional onClick for clickable cards
  - Add proper semantic HTML (article or div)
  - Test: Card renders correctly
  - _Requirements: 7.2_

- [ ] 5.3 Create Badge component
  - Create `app/components/UI/Badge.tsx`
  - Support color variants: green, yellow, red, blue, gray
  - Include icon support
  - Test: Badge renders with all colors
  - _Requirements: 12.2, 12.3, 12.4_

- [ ] 5.4 Create Modal component
  - Create `app/components/UI/Modal.tsx`
  - Implement backdrop with click-outside to close
  - Add escape key handler
  - Include proper ARIA attributes (role="dialog", aria-modal)
  - Trap focus within modal
  - Test: Modal opens, closes, and handles keyboard
  - _Requirements: 8.2, 8.5, 26.1_

---

## Milestone 1.6: Layout Components

- [ ] 6. Create ThemeToggle component
  - Create `app/components/Theme/ThemeToggle.tsx`
  - Connect to Redux theme slice
  - Display sun/moon icon based on current theme
  - Dispatch toggleTheme() on click
  - Add ARIA label for accessibility
  - Test: Theme toggles and persists
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 6.1 Create Sidebar component
  - Create `app/components/Layout/Sidebar.tsx`
  - Display navigation links: Dashboard, Sites, Alerts, Settings
  - Highlight active route using usePathname()
  - Show user avatar and name at bottom
  - Hide on mobile (< 768px)
  - Test: Sidebar renders and highlights active route
  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 6.2 Create Header component
  - Create `app/components/Layout/Header.tsx`
  - Display page title (dynamic based on route)
  - Include ThemeToggle button
  - Show mobile menu button (< 768px)
  - Display user avatar with dropdown
  - Test: Header renders correctly
  - _Requirements: 4.2_

- [ ] 6.3 Create MobileNav component
  - Create `app/components/Layout/MobileNav.tsx`
  - Implement drawer that slides in from left
  - Display all navigation links vertically
  - Connect to Redux UI slice for open/close state
  - Close on backdrop click or escape key
  - Test: Mobile nav opens, closes, and displays links
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.4 Create MainLayout component
  - Create `app/components/Layout/MainLayout.tsx`
  - Combine Sidebar, Header, and main content area
  - Handle responsive layout (sidebar hidden on mobile)
  - Wrap content in ErrorBoundary
  - Test: Layout renders correctly on all screen sizes
  - _Requirements: 4.1, 4.2, 4.3, 15.1, 15.2, 15.3_

- [ ] 6.5 Update root layout
  - Update `app/layout.tsx` to include Providers
  - Add theme class to html element based on Redux state
  - Include skip-to-content link for accessibility
  - Add proper semantic HTML structure
  - Test: Root layout renders without errors
  - _Requirements: 5.2, 26.1_

- [ ] 6.6 Create dashboard layout
  - Create `app/dashboard/layout.tsx`
  - Use MainLayout component
  - Add route protection (redirect if not authenticated)
  - Test: Dashboard layout renders correctly
  - _Requirements: 24.5_

---

## Milestone 1.7: Dashboard Overview Page

- [ ] 7. Create SiteCard component
  - Create `app/components/Dashboard/SiteCard.tsx`
  - Display site name, URL, and siteId
  - Show latest LCP, FID, CLS values with color-coded badges
  - Add hover effect
  - Make clickable to navigate to site details
  - Include proper ARIA labels
  - Test: Card renders with mock data
  - _Requirements: 7.2, 7.5, 12.1, 12.2, 12.3, 12.4_

- [ ] 7.1 Write unit tests for SiteCard
  - Create `app/components/Dashboard/SiteCard.test.tsx`
  - Test site name and URL render correctly
  - Test metric badges display with correct colors
  - Test onClick handler is called
  - Test ARIA labels are present
  - _Requirements: 7.2_

- [ ] 7.2 Create SiteOverviewGrid component
  - Create `app/components/Dashboard/SiteOverviewGrid.tsx`
  - Display sites in responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
  - Map over sites array and render SiteCard for each
  - Test: Grid renders multiple site cards
  - _Requirements: 7.1, 15.1, 15.2, 15.3_

- [ ] 7.3 Create EmptyState component
  - Create `app/components/Dashboard/EmptyState.tsx`
  - Display illustration or icon
  - Show heading: "No sites configured"
  - Show descriptive text explaining how to add a site
  - Include "Add Your First Site" button
  - Test: Empty state renders correctly
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 7.4 Create AddSiteModal component
  - Create `app/components/Dashboard/AddSiteModal.tsx`
  - Use Modal component as base
  - Create form with react-hook-form and Zod validation
  - Include fields: site name, site URL
  - Display validation errors below fields
  - Handle form submission (mock for now)
  - Test: Modal opens, validates, and submits
  - _Requirements: 8.2, 8.3, 8.4, 23.2, 23.3, 23.4, 23.5_

- [ ] 7.5 Implement dashboard page
  - Create `app/dashboard/page.tsx`
  - Use useSites() hook to fetch sites
  - Show CardSkeleton while loading
  - Show EmptyState when no sites
  - Show SiteOverviewGrid when sites exist
  - Include "Add New Site" button that opens modal
  - Test: Page renders correctly in all states
  - _Requirements: 7.1, 7.3, 8.1, 22.1_

---

## Milestone 1.8: Site Details Page - Metric Cards

- [ ] 8. Create MetricCard component
  - Create `app/components/SiteDetails/MetricCard.tsx`
  - Display metric name (LCP, FID, CLS)
  - Show current value with unit
  - Display color-coded status badge (green/yellow/red)
  - Show trend indicator (up/down arrow) and percentage
  - Include tooltip with threshold information
  - Test: Card renders with all metric types
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 8.1 Write unit tests for MetricCard
  - Create `app/components/SiteDetails/MetricCard.test.tsx`
  - Test metric name and value display
  - Test status badge color for good/needs-improvement/poor
  - Test trend indicator displays correctly
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 8.2 Create MetricsGrid component
  - Create `app/components/SiteDetails/MetricsGrid.tsx`
  - Display 3 MetricCards in responsive grid
  - Pass LCP, FID, CLS data to respective cards
  - Test: Grid renders all three metric cards
  - _Requirements: 10.2_

- [ ] 8.3 Create SiteHeader component
  - Create `app/components/SiteDetails/SiteHeader.tsx`
  - Display site name as h1
  - Show site URL as link
  - Include back button to dashboard
  - Test: Header renders site information
  - _Requirements: 10.1_

---

## Milestone 1.9: Site Details Page - Charts

- [ ] 9. Create ChartContainer component
  - Create `app/components/Charts/ChartContainer.tsx`
  - Wrapper component for consistent chart styling
  - Include title and optional description
  - Handle responsive sizing
  - Test: Container renders correctly
  - _Requirements: 11.5_

- [ ] 9.1 Create LCPChart component
  - Create `app/components/Charts/LCPChart.tsx`
  - Use Recharts LineChart
  - X-axis: timestamp, Y-axis: LCP value (ms)
  - Add threshold lines at 2500ms (good) and 4000ms (poor)
  - Include tooltip showing exact values
  - Add axis labels and legend
  - Make responsive with ResponsiveContainer
  - Test: Chart renders with mock data
  - _Requirements: 11.1, 11.5_

- [ ] 9.2 Create FIDChart component
  - Create `app/components/Charts/FIDChart.tsx`
  - Use Recharts BarChart
  - X-axis: time buckets, Y-axis: FID value (ms)
  - Add threshold lines at 100ms (good) and 300ms (poor)
  - Include tooltip and legend
  - Test: Chart renders with mock data
  - _Requirements: 11.2, 11.5_

- [ ] 9.3 Create CLSChart component
  - Create `app/components/Charts/CLSChart.tsx`
  - Use Recharts AreaChart
  - X-axis: timestamp, Y-axis: CLS score
  - Add threshold lines at 0.1 (good) and 0.25 (poor)
  - Include tooltip and legend
  - Test: Chart renders with mock data
  - _Requirements: 11.3, 11.5_

- [ ] 9.4 Add accessibility to charts
  - Add role="img" and aria-label to each chart
  - Include sr-only text with summary statistics
  - Ensure charts have descriptive titles
  - Test: Screen reader announces chart information
  - _Requirements: 26.2, 26.4_

---

## Milestone 1.10: Site Details Page - Filters

- [ ] 10. Create TimeRangeSelector component
  - Create `app/components/SiteDetails/TimeRangeSelector.tsx`
  - Display buttons for 24h, 7d, 30d options
  - Highlight selected option
  - Update local state on selection
  - Test: Selector updates selected state
  - _Requirements: 13.1, 13.3_

- [ ] 10.1 Create FilterBar component
  - Create `app/components/SiteDetails/FilterBar.tsx`
  - Include dropdowns for device type (mobile, desktop, tablet, all)
  - Include dropdown for browser (Chrome, Firefox, Safari, Edge, all)
  - Display active filter badges
  - Include "Clear Filters" button
  - Test: Filters update state correctly
  - _Requirements: 14.1, 14.4, 14.5_

- [ ] 10.2 Implement site details page
  - Create `app/dashboard/[siteId]/page.tsx`
  - Use useSite(siteId) and useMetrics(siteId, filters) hooks
  - Manage filter state (timeRange, deviceType, browser)
  - Show ChartSkeleton while loading
  - Render SiteHeader, MetricsGrid, TimeRangeSelector, FilterBar
  - Render LCPChart, FIDChart, CLSChart
  - Update charts when filters change
  - Test: Page renders and filters work
  - _Requirements: 10.1, 10.2, 10.3, 13.2, 13.4, 14.2, 14.3_

- [ ] 10.3 Add default time range on page load
  - Set initial timeRange state to '24h'
  - Test: Page loads with 24h selected by default
  - _Requirements: 13.5_

---

## Milestone 1.11: Authentication Pages

- [ ] 11. Create LoginForm component
  - Create `app/components/Auth/LoginForm.tsx`
  - Use react-hook-form with loginSchema validation
  - Include email and password fields
  - Display validation errors
  - Handle form submission (mock authentication for now)
  - Store token in Redux and localStorage on success
  - Test: Form validates and submits
  - _Requirements: 23.2, 23.3, 24.1_

- [ ] 11.1 Create SignupForm component
  - Create `app/components/Auth/SignupForm.tsx`
  - Use react-hook-form with signupSchema validation
  - Include email, password, confirmPassword fields
  - Display validation errors
  - Handle form submission (mock for now)
  - Test: Form validates password complexity and matching
  - _Requirements: 23.2, 23.3_

- [ ] 11.2 Create login page
  - Create `app/auth/login/page.tsx`
  - Render LoginForm component
  - Redirect to dashboard if already authenticated
  - Include link to signup page
  - Test: Page renders and redirects correctly
  - _Requirements: 24.2, 24.5_

- [ ] 11.3 Create signup page
  - Create `app/auth/signup/page.tsx`
  - Render SignupForm component
  - Redirect to dashboard if already authenticated
  - Include link to login page
  - Test: Page renders correctly
  - _Requirements: 24.5_

- [ ] 11.4 Implement route protection middleware
  - Create `middleware.ts` in root directory
  - Check for authentication token
  - Redirect to /auth/login if not authenticated and accessing protected routes
  - Allow access to /auth/\* routes without authentication
  - Test: Protected routes redirect correctly
  - _Requirements: 24.5, 58_

---

## Milestone 1.12: Testing & Quality Assurance

- [ ] 12. Checkpoint - Ensure all tests pass
  - Run `npm run lint` and fix any linting errors
  - Run `npm run type-check` and fix any TypeScript errors
  - Run `npm test` and ensure all unit tests pass
  - Run property-based tests and verify 100 iterations pass
  - Test application manually in browser
  - Ask the user if questions arise
  - _Requirements: All_

- [ ] 12.1 Set up Jest and React Testing Library
  - Install dependencies: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom`
  - Create `jest.config.js` with Next.js configuration
  - Create `jest.setup.js` for test environment setup
  - Add test scripts to package.json
  - Test: `npm test` runs successfully
  - _Requirements: Testing infrastructure_

- [ ] 12.2 Write unit tests for utility functions
  - Create `lib/utils/metrics.test.ts`
  - Test getMetricStatus for all metric types and ranges
  - Test getMetricColor returns correct Tailwind classes
  - Test formatters produce expected output
  - Aim for 90%+ coverage on utilities
  - _Requirements: 12.2, 12.3, 12.4_

- [ ] 12.3 Write unit tests for Redux slices
  - Create tests for themeSlice, userSlice, uiSlice
  - Test all actions update state correctly
  - Test selectors return correct values
  - Test initial state is correct
  - Aim for 85%+ coverage on slices
  - _Requirements: 5.1, 24.1, 24.4_

- [ ] 12.4 Write integration tests for key user flows
  - Test dashboard page loads and displays sites
  - Test site details page loads and displays metrics
  - Test filters update charts correctly
  - Test theme toggle persists across page reloads
  - Test form validation prevents invalid submissions
  - _Requirements: 7.1, 10.2, 13.2, 14.2, 23.3_

---

## Milestone 1.13: Performance Optimization & Polish

- [ ] 13. Optimize bundle size
  - Analyze bundle with `npm run build`
  - Implement code splitting for chart components using dynamic imports
  - Verify initial bundle < 150KB gzipped
  - Test: Build completes and bundle sizes are within targets
  - _Requirements: 20.4_

- [ ] 13.1 Add performance optimizations
  - Memoize expensive computations with useMemo
  - Memoize SiteCard component with React.memo
  - Debounce chart resize events
  - Test: Application feels responsive
  - _Requirements: 20.2, 20.5_

- [ ] 13.2 Run Lighthouse audit
  - Build production version: `npm run build && npm start`
  - Run Lighthouse on dashboard and site details pages
  - Verify Performance score 90+
  - Verify Accessibility score 95+
  - Fix any issues identified
  - Test: Lighthouse scores meet targets
  - _Requirements: 20.1_

- [ ] 13.3 Verify accessibility compliance
  - Test keyboard navigation through all interactive elements
  - Verify all images have alt text
  - Verify all form inputs have associated labels
  - Test with screen reader (VoiceOver on Mac or NVDA on Windows)
  - Verify color contrast meets WCAG AA standards
  - Test: All accessibility requirements met
  - _Requirements: 26.1, 26.2, 26.3, 26.4_

- [ ] 13.4 Add loading states and error handling
  - Verify all data fetching shows skeleton loaders
  - Verify all errors display user-friendly messages
  - Verify error boundary catches component errors
  - Test: All loading and error states work correctly
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ] 13.5 Polish UI and responsive design
  - Test on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
  - Verify no horizontal scrolling on any screen size
  - Verify mobile navigation works correctly
  - Verify charts are readable on all screen sizes
  - Fix any visual issues
  - Test: Application looks good on all devices
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

---

## Milestone 1.14: Final Integration & Documentation

- [ ] 14. Create landing page
  - Create `app/page.tsx` for marketing/landing page
  - Include hero section with product description
  - Add "Get Started" button linking to signup
  - Include features section highlighting key benefits
  - Test: Landing page renders correctly
  - _Requirements: Project completeness_

- [ ] 14.1 Update documentation
  - Update README.md with final setup instructions
  - Document all environment variables in .env.example
  - Add screenshots to README
  - Document component structure and architecture
  - Include troubleshooting section
  - Test: Documentation is clear and complete
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 14.2 Prepare for Week 3 API integration
  - Document API integration points in README
  - Ensure mock data structure matches Prisma schema exactly
  - Create checklist for Week 3 API integration tasks
  - Test: Mock data structure is correct
  - _Requirements: 27.1_

- [ ] 14.3 Final checkpoint - Complete testing
  - Run full test suite: `npm test`
  - Run linting: `npm run lint`
  - Run type checking: `npm run type-check`
  - Build production: `npm run build`
  - Test application end-to-end manually
  - Verify all Week 1 requirements are met
  - Ask the user if questions arise
  - _Requirements: All_

---

## Summary

This implementation plan covers all Week 1 requirements with 14 milestones and 80+ tasks. The plan follows an incremental approach:

1. **Milestones 1.1-1.2**: Foundation (project setup, state management)
2. **Milestones 1.3-1.4**: Data layer (mock data, API client, React Query)
3. **Milestones 1.5-1.6**: UI foundation (base components, layout)
4. **Milestones 1.7-1.10**: Feature pages (dashboard, site details, charts, filters)
5. **Milestone 1.11**: Authentication
6. **Milestones 1.12-1.14**: Quality assurance, optimization, documentation

**Key Features Delivered:**

- ✅ Next.js 15 with TypeScript and Tailwind CSS
- ✅ Redux Toolkit + React Query state management
- ✅ Complete dashboard with site overview
- ✅ Site details page with charts and filters
- ✅ Authentication pages (login/signup)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/light theme with persistence
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Property-based testing with fast-check
- ✅ Mock data ready for Week 3 API integration

**Testing Coverage:**

- Unit tests for components and utilities
- Property-based tests for critical logic
- Integration tests for user flows
- Accessibility testing
- Performance testing (Lighthouse)

**Ready for Week 3:**

- Mock data structure matches API responses
- API client configured with interceptors
- React Query hooks ready to swap mock data for real API calls
- Environment variables configured for API integration
