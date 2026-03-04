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

## Database Migrations

### Overview

Database schema changes are managed using Prisma Migrate, which provides version-controlled, reproducible migrations. All migrations are stored in `apps/api/prisma/migrations/` and tracked in the `_prisma_migrations` table.

### Creating New Migrations

When you need to modify the database schema:

1. **Update the Prisma Schema**
   ```bash
   # Edit apps/api/prisma/schema.prisma
   # Add, modify, or remove models and fields
   ```

2. **Generate Migration**
   ```bash
   cd apps/api
   npx prisma migrate dev --name descriptive_migration_name
   ```
   
   This command will:
   - Generate SQL migration file in `prisma/migrations/`
   - Apply the migration to your development database
   - Regenerate Prisma Client with updated types
   - Update the migration history table

3. **Review Generated SQL**
   ```bash
   # Check the generated migration file
   cat prisma/migrations/TIMESTAMP_descriptive_migration_name/migration.sql
   ```
   
   **Important:** Always review the generated SQL to ensure it matches your intentions, especially for:
   - Data migrations that need custom logic
   - Column renames (Prisma may drop and recreate)
   - Index changes that could impact performance

4. **Commit Migration Files**
   ```bash
   git add prisma/migrations/
   git add prisma/schema.prisma
   git commit -m "feat: add migration for [description]"
   ```

### Applying Migrations

#### Development Environment

Migrations are automatically applied when you run `npx prisma migrate dev`:

```bash
cd apps/api
npx prisma migrate dev
```

This command:
- Applies pending migrations
- Regenerates Prisma Client
- Runs seed script if configured

#### Production Environment

For production deployments, use `migrate deploy`:

```bash
cd apps/api
npx prisma migrate deploy
```

This command:
- Applies all pending migrations
- Does NOT regenerate Prisma Client (build separately)
- Does NOT run seed scripts
- Fails fast if migrations cannot be applied

**Best Practices for Production:**
- Always test migrations in staging first
- Run migrations during maintenance windows for breaking changes
- Monitor database performance during and after migration
- Have rollback plan ready before applying

### Rollback Procedures

Prisma Migrate does not have built-in rollback commands. To rollback a migration:

#### Option 1: Manual Rollback (Recommended for Production)

1. **Identify the Migration to Rollback**
   ```bash
   # List all applied migrations
   npx prisma migrate status
   ```

2. **Create Rollback SQL**
   - Review the migration SQL file
   - Write inverse SQL statements
   - Example: If migration adds a column, rollback drops it

3. **Apply Rollback Manually**
   ```bash
   # Connect to database
   psql $DATABASE_URL
   
   # Execute rollback SQL
   ALTER TABLE "User" DROP COLUMN "newColumn";
   
   # Remove migration from history
   DELETE FROM "_prisma_migrations" 
   WHERE migration_name = 'TIMESTAMP_migration_name';
   ```

4. **Update Schema File**
   - Revert changes in `prisma/schema.prisma`
   - Regenerate Prisma Client: `npx prisma generate`

#### Option 2: Database Reset (Development Only)

**⚠️ WARNING: This deletes all data!**

```bash
cd apps/api
npx prisma migrate reset
```

This command:
- Drops the database
- Creates a new database
- Applies all migrations from scratch
- Runs seed script

**Use only in development environments!**

#### Option 3: Revert to Previous Migration

1. **Reset to Specific Migration**
   ```bash
   # This is a manual process:
   # 1. Drop database
   # 2. Create fresh database
   # 3. Apply migrations up to desired point
   
   # Example:
   psql -c "DROP DATABASE webvitals;"
   psql -c "CREATE DATABASE webvitals;"
   
   # Apply migrations manually one by one
   psql $DATABASE_URL < prisma/migrations/TIMESTAMP_1/migration.sql
   psql $DATABASE_URL < prisma/migrations/TIMESTAMP_2/migration.sql
   ```

2. **Update Migration History**
   ```bash
   # Mark migrations as applied in _prisma_migrations table
   # This is complex and error-prone - use with caution
   ```

### Migration Failure Handling

Prisma Migrate uses database transactions to ensure atomicity. If a migration fails:

#### Automatic Rollback

- **Transaction-based migrations** automatically rollback on failure
- Database remains in the state before the migration
- No partial changes are applied

#### Handling Failed Migrations

1. **Check Migration Status**
   ```bash
   npx prisma migrate status
   ```
   
   Output will show:
   - Applied migrations (✓)
   - Pending migrations (⚠)
   - Failed migrations (✗)

2. **Review Error Message**
   ```bash
   # Error messages indicate:
   # - SQL syntax errors
   # - Constraint violations
   # - Data type conflicts
   # - Missing dependencies
   ```

3. **Fix the Issue**
   
   **Option A: Fix Schema and Retry**
   ```bash
   # Edit prisma/schema.prisma to fix the issue
   # Delete the failed migration folder
   rm -rf prisma/migrations/TIMESTAMP_failed_migration/
   
   # Create new migration
   npx prisma migrate dev --name fixed_migration_name
   ```
   
   **Option B: Fix Generated SQL**
   ```bash
   # Edit the migration SQL file directly
   nano prisma/migrations/TIMESTAMP_migration/migration.sql
   
   # Mark migration as rolled back
   npx prisma migrate resolve --rolled-back TIMESTAMP_migration
   
   # Create new migration with fix
   npx prisma migrate dev --name migration_fix
   ```

4. **Verify Database State**
   ```bash
   # Check that database is in expected state
   npx prisma db pull
   
   # Compare with schema.prisma
   npx prisma migrate diff \
     --from-schema-datamodel prisma/schema.prisma \
     --to-schema-datasource prisma/schema.prisma
   ```

### Common Migration Scenarios

#### Adding a New Model

```prisma
// prisma/schema.prisma
model NewModel {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name add_new_model
```

#### Adding a Required Field

```prisma
// Option 1: Add with default value
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  newField String @default("default_value")
}

// Option 2: Add as optional first, then make required
model User {
  id       Int     @id @default(autoincrement())
  email    String  @unique
  newField String? // Add as optional
}
```

```bash
# Step 1: Add optional field
npx prisma migrate dev --name add_new_field_optional

# Step 2: Populate data
# Write script to populate newField for existing records

# Step 3: Make required
# Edit schema to remove ? and add @default if needed
npx prisma migrate dev --name make_new_field_required
```

#### Renaming a Column

```prisma
// Prisma will drop and recreate by default
// To preserve data, use custom SQL:

// 1. Create migration
npx prisma migrate dev --name rename_column --create-only

// 2. Edit migration SQL
// Replace DROP/CREATE with RENAME:
ALTER TABLE "User" RENAME COLUMN "oldName" TO "newName";

// 3. Apply migration
npx prisma migrate dev
```

#### Adding an Index

```prisma
model Metric {
  id        Int      @id @default(autoincrement())
  timestamp DateTime @default(now())
  
  @@index([timestamp]) // Add index
}
```

```bash
npx prisma migrate dev --name add_timestamp_index
```

### Migration Best Practices

1. **Always Review Generated SQL**
   - Prisma may not generate optimal SQL for complex changes
   - Check for data loss scenarios (column renames, type changes)

2. **Use Descriptive Migration Names**
   - Good: `add_user_avatar_field`
   - Bad: `update_schema`

3. **Keep Migrations Small**
   - One logical change per migration
   - Easier to review and rollback

4. **Test Migrations in Staging**
   - Apply to staging environment first
   - Verify application works with new schema
   - Check performance impact

5. **Backup Before Production Migrations**
   ```bash
   # Create database backup
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

6. **Handle Data Migrations Carefully**
   - Use `--create-only` flag to edit SQL manually
   - Add data transformation logic in migration SQL
   - Consider using separate data migration scripts

7. **Monitor Migration Performance**
   - Large table alterations can lock tables
   - Consider using `CONCURRENTLY` for index creation
   - Plan for downtime if needed

### Troubleshooting

#### Migration History Out of Sync

```bash
# Check status
npx prisma migrate status

# If migrations are out of sync:
# Option 1: Mark as applied (if already applied manually)
npx prisma migrate resolve --applied TIMESTAMP_migration_name

# Option 2: Mark as rolled back (if failed)
npx prisma migrate resolve --rolled-back TIMESTAMP_migration_name
```

#### Schema Drift Detected

```bash
# When local schema doesn't match database:
npx prisma db pull  # Pull schema from database
npx prisma migrate dev  # Create migration for differences
```

#### Cannot Connect to Database

```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Verify PostgreSQL is running
pg_isready -h localhost -p 5432
```

### Migration Scripts Reference

Add these scripts to `package.json` for convenience:

```json
{
  "scripts": {
    "db:migrate": "npx prisma migrate dev",
    "db:migrate:deploy": "npx prisma migrate deploy",
    "db:migrate:status": "npx prisma migrate status",
    "db:migrate:reset": "npx prisma migrate reset",
    "db:push": "npx prisma db push",
    "db:pull": "npx prisma db pull",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "npx prisma studio"
  }
}
```

### Related Documentation

- **Prisma Migrate Docs:** https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Schema Reference:** `apps/api/prisma/schema.prisma`
- **Migration Files:** `apps/api/prisma/migrations/`
- **Requirements:** See `requirements.md` section 28 (Database Migrations)
- **Design:** See `design.md` section on Database Migrations

## Support

- **Requirements:** See `requirements.md` for detailed acceptance criteria
- **Design:** See `design.md` for architecture and API specs
- **Integration:** See `docs/WEEK3_INTEGRATION.md` for frontend integration
- **Frontend Spec:** See `.kiro/specs/frontend-dashboard/` for frontend reference

---

**Status:** Ready for implementation
**Estimated Time:** 3-5 days
**Next Phase:** Week 4 - WebSockets, Tracking SDK, Deployment
