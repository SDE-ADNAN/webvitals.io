# Week 3 Backend API Specification

## Overview

Complete specification for building the WebVitals.io backend API. This spec follows the same structured approach as Week 1 frontend development.

## Spec Documents

1. **[requirements.md](./requirements.md)** - 30 EARS-compliant requirements covering all backend functionality
2. **[design.md](./design.md)** - Architecture, database schema, API endpoints, and correctness properties
3. **[tasks.md](./tasks.md)** - 10 milestones with 40+ actionable implementation tasks

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Week 1 frontend complete

### Implementation Order
1. Review requirements document
2. Study design document
3. Execute tasks in order from tasks.md
4. Reference `docs/WEEK3_INTEGRATION.md` for detailed specs

## Key Features

**Authentication:**
- User registration with email/password
- JWT-based authentication
- Password hashing with bcrypt
- 7-day token expiration

**Site Management:**
- Create, read, update, delete sites
- Unique siteId generation
- User ownership verification

**Metrics:**
- Collect metrics from tracking SDK
- Retrieve with filtering (time, device, browser)
- Calculate summary statistics (avg, p95)

**Alerts:**
- Create performance alerts
- Configure thresholds and conditions
- Manage alert lifecycle

**Security:**
- CORS configuration
- Rate limiting (100 req/15min)
- Input validation with Zod
- SQL injection prevention

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Testing:** Jest + Supertest

## Integration with Frontend

Frontend types in `packages/types/` match API responses exactly. See `docs/WEEK3_INTEGRATION.md` for complete integration guide.

## Next Steps

1. Open `tasks.md` and start with Milestone 1
2. Execute tasks in order
3. Test after each milestone
4. Integrate with frontend in Milestone 10

## Support

- **Requirements:** See `requirements.md` for detailed acceptance criteria
- **Design:** See `design.md` for architecture and API specs
- **Integration:** See `docs/WEEK3_INTEGRATION.md` for frontend integration
- **Frontend Spec:** See `.kiro/specs/frontend-dashboard/` for frontend reference

---

**Status:** Ready for implementation
**Estimated Time:** 3-5 days
**Next Phase:** Week 4 - WebSockets, Tracking SDK, Deployment
