# WebVitals API Server

This is the Express.js backend API server for WebVitals.io (separate from Next.js for independent deployment).

## Development

```bash
# From the monorepo root
npm run dev

# Or from this directory
npm run dev
```

## Build

```bash
# From the monorepo root
npm run build

# Or from this directory
npm run build
```

## Dependencies

This app depends on:
- `@webvitals/types` - Shared TypeScript types

## Structure

- `src/` - API server source code
- `dist/` - Compiled JavaScript output (generated)

## Database Migrations

This project uses Prisma for database schema management and migrations. All schema changes are tracked through migration files, ensuring reproducibility across environments.

### Overview

Prisma migrations provide:
- **Version-controlled schema changes** - All migrations tracked in Git
- **Automatic SQL generation** - Prisma generates migration SQL from schema changes
- **Transaction-based execution** - Failed migrations automatically roll back
- **Migration history tracking** - `_prisma_migrations` table records all applied migrations
- **Type-safe database access** - Prisma Client regenerated with each migration

### Quick Reference

```bash
# Development workflow
npx prisma migrate dev --name my_migration    # Create and apply migration
npx prisma migrate status                     # Check migration status
npx prisma migrate reset                      # Reset database (deletes data!)

# Production deployment
npx prisma migrate deploy                     # Apply pending migrations

# Troubleshooting
npx prisma migrate resolve --applied "name"   # Mark migration as applied
npx prisma migrate resolve --rolled-back "name" # Mark migration as rolled back
```

**⚠️ Important:** Always use `migrate deploy` in production, never `migrate dev` or `migrate reset`.

### Creating New Migrations

When you modify the Prisma schema (`prisma/schema.prisma`), you need to create a migration:

```bash
# 1. Modify prisma/schema.prisma with your changes
# 2. Generate and apply the migration
npx prisma migrate dev --name descriptive_migration_name

# Example: Adding a new field
npx prisma migrate dev --name add_user_avatar_field
```

**What happens:**
- Prisma generates a SQL migration file in `prisma/migrations/`
- The migration is automatically applied to your development database
- Prisma Client is regenerated with updated types

**Best Practices:**
- Use descriptive migration names (e.g., `add_user_role`, `create_notifications_table`)
- Keep migrations small and focused on a single change
- Review the generated SQL before committing
- Always test migrations in a staging environment before production

### Applying Migrations

#### Development Environment

In development, use `migrate dev` to apply migrations and regenerate the Prisma Client:

```bash
# Apply pending migrations and regenerate Prisma Client
npx prisma migrate dev

# Or use the npm script
npm run db:migrate
```

**What `migrate dev` does:**
1. Checks for schema changes in `prisma/schema.prisma`
2. Prompts to create a new migration if changes detected
3. Applies all pending migrations to the database
4. Regenerates Prisma Client with updated types
5. Updates the `_prisma_migrations` table

**When to use:**
- During active development
- When testing schema changes locally
- After pulling new migrations from Git

#### Production Environment

In production, use `migrate deploy` to apply migrations without prompts or client regeneration:

```bash
# Apply pending migrations (non-interactive, safe for CI/CD)
npx prisma migrate deploy

# Or use the npm script
npm run db:migrate:deploy
```

**What `migrate deploy` does:**
1. Applies only pending migrations (no new migration creation)
2. Does not prompt for input (safe for automated deployments)
3. Does not regenerate Prisma Client (use `prisma generate` separately)
4. Does not reset the database
5. Updates the `_prisma_migrations` table

**When to use:**
- Production deployments
- Staging environment deployments
- CI/CD pipelines
- Any automated deployment process

**Important:** Always use `migrate deploy` in production, never `migrate dev`. The `deploy` command is designed for production use and will not create new migrations or reset your database.

#### Deployment Best Practices

1. **Backup before deploying:**
   ```bash
   # Create a database backup before applying migrations
   pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test in staging first:**
   ```bash
   # Apply to staging environment
   DATABASE_URL="postgresql://staging..." npx prisma migrate deploy
   
   # Run tests
   npm test
   
   # Only then deploy to production
   ```

3. **Use in CI/CD pipeline:**
   ```yaml
   # Example GitHub Actions workflow
   - name: Run database migrations
     run: npx prisma migrate deploy
     env:
       DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```

4. **Monitor migration execution:**
   - Check migration logs for errors
   - Verify migration completed successfully
   - Test application functionality after migration

### Checking Migration Status

```bash
# Check which migrations have been applied
npx prisma migrate status

# Or use the npm script
npm run db:migrate:status
```

This shows:
- Pending migrations (not yet applied)
- Applied migrations (already in database)
- Migration history from `_prisma_migrations` table

### Rollback Procedures

**Important:** Prisma does not have automatic rollback commands for applied migrations. Rollbacks must be done manually. However, **failed migrations automatically roll back** within their transaction (see "Migration Failure Handling" section).

#### Understanding Rollback Scenarios

1. **Failed Migration (Automatic)** - Prisma automatically rolls back failed migrations
2. **Applied Migration (Manual)** - You must manually create a reverse migration

#### Option 1: Create a Reverse Migration (Recommended)

This is the safest and most trackable approach:

1. **Identify the migration to rollback:**
   ```bash
   npx prisma migrate status
   # Review the list of applied migrations
   ```

2. **Modify the schema to reverse the change:**
   ```prisma
   // Example: If you added a field, remove it
   model User {
     id    String @id @default(uuid())
     email String
     // role  String @default("user")  // Remove this line
   }
   ```

3. **Create a new migration that reverses the change:**
   ```bash
   npx prisma migrate dev --name rollback_add_user_role
   ```

4. **Verify the rollback:**
   ```bash
   npx prisma migrate status
   npx prisma studio  # Visually verify the schema
   ```

**Advantages:**
- ✅ Tracked in migration history
- ✅ Can be applied to other environments
- ✅ Reversible if needed
- ✅ Safe and auditable

**Example Rollback Scenarios:**

```prisma
// Scenario 1: Rollback added field
// Original migration added: role String @default("user")
// Rollback: Remove the field from schema, create new migration

// Scenario 2: Rollback added table
// Original migration added: model Notification { ... }
// Rollback: Remove the model from schema, create new migration

// Scenario 3: Rollback modified field
// Original migration changed: email String to emailAddress String
// Rollback: Change back to email String, create new migration
```

#### Option 2: Manual SQL Rollback (Advanced)

For urgent production issues, you can manually execute SQL:

1. **Connect to the database:**
   ```bash
   psql -d your_database_name
   # Or use your preferred database client
   ```

2. **Execute the reverse SQL manually:**
   ```sql
   -- Example: Rollback adding a column
   ALTER TABLE "User" DROP COLUMN "role";
   
   -- Example: Rollback creating a table
   DROP TABLE "Notification";
   
   -- Example: Rollback adding an index
   DROP INDEX "User_email_role_idx";
   ```

3. **Update the migration history:**
   ```sql
   -- Mark the migration as rolled back
   UPDATE "_prisma_migrations" 
   SET rolled_back_at = NOW()
   WHERE migration_name = '20231220154321_add_user_role';
   ```

4. **Update your schema file:**
   - Modify `prisma/schema.prisma` to match the database state
   - Run `npx prisma db pull` to sync schema from database

5. **Verify consistency:**
   ```bash
   npx prisma migrate status
   # Should show no drift
   ```

**⚠️ Warnings:**
- This approach bypasses Prisma's migration tracking
- Can cause schema drift if not done carefully
- Should only be used in emergencies
- Requires manual coordination across environments

#### Option 3: Database Reset (Development Only)

For development environments, you can reset and reapply migrations:

```bash
# WARNING: This deletes all data!
npx prisma migrate reset

# Or use the npm script
npm run db:migrate:reset
```

**What this does:**
1. Drops the database
2. Recreates the database
3. Applies all migrations from scratch
4. Runs seed script (if configured)

**When to use:**
- ✅ Local development environment
- ✅ Testing migration sequences
- ✅ Fixing corrupted migration state
- ❌ **NEVER in production!**
- ❌ **NEVER in staging with important data!**

#### Option 4: Restore from Backup (Production Emergency)

For critical production issues:

1. **Stop the application:**
   ```bash
   # Prevent new database connections
   systemctl stop your-app
   ```

2. **Restore from backup:**
   ```bash
   # Restore the database from backup
   psql -d your_database_name < backup_20231220_120000.sql
   ```

3. **Verify the restoration:**
   ```bash
   npx prisma migrate status
   # Check which migrations are applied
   ```

4. **Update application code:**
   - Revert to the previous application version if needed
   - Ensure code matches database schema

5. **Restart the application:**
   ```bash
   systemctl start your-app
   ```

#### Rollback Decision Matrix

| Scenario | Recommended Approach | Risk Level |
|----------|---------------------|------------|
| Development environment | Option 3: Database Reset | Low |
| Applied migration, no data loss | Option 1: Reverse Migration | Low |
| Applied migration, data loss risk | Option 1: Reverse Migration + Data Migration | Medium |
| Production emergency | Option 4: Restore from Backup | High |
| Failed migration | No action needed (automatic rollback) | None |
| Schema drift | Option 1: Create fixing migration | Low |

#### Preventing the Need for Rollbacks

1. **Test migrations thoroughly:**
   ```bash
   # Test in local environment
   npx prisma migrate dev --name my_change
   npm test
   
   # Test in staging
   DATABASE_URL="staging..." npx prisma migrate deploy
   npm test
   ```

2. **Use feature flags:**
   - Deploy schema changes before code changes
   - Use feature flags to enable new features gradually
   - Allows schema to be in place before code uses it

3. **Make backward-compatible changes:**
   - Add optional fields first, make required later
   - Keep old columns while adding new ones
   - Remove deprecated columns in separate migration

4. **Review generated SQL:**
   ```bash
   # Always check the generated migration file
   cat prisma/migrations/[timestamp]_[name]/migration.sql
   ```

5. **Maintain backups:**
   ```bash
   # Automate regular backups
   pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

### Migration Failure Handling

Prisma automatically handles migration failures through **transaction-based migrations**. This ensures database integrity by preventing partial migrations from being applied.

#### Automatic Rollback Behavior

When a migration fails, Prisma automatically:
- **Rolls back the entire transaction** - No partial changes are applied
- **Preserves the database state** - Database remains in its previous working state
- **Marks the migration as failed** - Recorded in the `_prisma_migrations` table
- **Provides clear error messages** - Helps identify the cause of failure

**Key Guarantee:** If any statement in a migration fails, all previous statements in that migration are automatically rolled back. This is handled by PostgreSQL's transaction system.

#### Verified Failure Scenarios

The migration failure handling has been tested and verified for:

1. **Constraint Violations**
   - Adding NOT NULL columns to tables with existing NULL values
   - Foreign key constraint violations
   - Unique constraint violations

2. **SQL Syntax Errors**
   - Invalid SQL statements
   - References to non-existent tables or columns
   - Type mismatches

3. **Permission Issues**
   - Insufficient database privileges
   - Schema access restrictions

**Testing:** Run `npm run test:migration-failure` to verify automatic rollback behavior. See `test-migration-failure.ts` for implementation details.

#### Handling Failed Migrations

1. **Check the error message:**
   ```bash
   npx prisma migrate dev
   # Read the error output carefully - it will indicate the specific SQL statement that failed
   ```

2. **Common failure causes:**
   - **Syntax errors** in the migration SQL
   - **Constraint violations** (e.g., adding NOT NULL to column with existing NULL values)
   - **Foreign key conflicts** (referencing non-existent records)
   - **Insufficient database permissions**
   - **Data type mismatches**

3. **Fix the issue:**
   - Modify your `prisma/schema.prisma` to fix the problem
   - For data conflicts, you may need to manually update data first
   - Run the migration again

4. **Verify database state:**
   ```bash
   npx prisma migrate status
   # Ensure no migrations are in a failed state
   # Database should be at the last successful migration
   ```

#### Example: Handling a Failed Migration Due to Data Conflict

```bash
# Scenario: Migration fails because you're adding a NOT NULL column to a table with existing rows

# Solution 1: Add a default value
model User {
  id    String @id @default(uuid())
  email String
  role  String @default("user") // Add default value - migration will succeed
}

# Solution 2: Make it optional first, then migrate data in steps
# Step 1: Add as optional
model User {
  id    String  @id @default(uuid())
  email String
  role  String? // Optional first
}

# Step 2: Create migration
npx prisma migrate dev --name add_optional_role_field

# Step 3: Write a data migration script to populate the field
# (See "Data Migrations" section below)

# Step 4: Make it required in another migration
model User {
  id    String @id @default(uuid())
  email String
  role  String // Now required
}

npx prisma migrate dev --name make_role_required
```

#### What Happens During a Failed Migration

1. **Migration starts** - Prisma begins executing SQL statements within a transaction
2. **Statement fails** - One SQL statement encounters an error
3. **Automatic rollback** - PostgreSQL rolls back all changes in the transaction
4. **Database unchanged** - Database remains in the state before the migration started
5. **Error reported** - Prisma reports the error with details
6. **Migration marked as failed** - Recorded in `_prisma_migrations` table

**Important:** Because of automatic rollback, you never need to manually undo changes from a failed migration. The database is automatically restored to its previous state.

#### Verifying Rollback Behavior

To verify that rollback works correctly, you can:

1. **Run the test suite:**
   ```bash
   npm run test:migration-failure
   ```

2. **Check the test documentation:**
   - See `test-migration-workflow.md` for detailed test scenarios
   - See `test-migration-failure.ts` for automated test implementation

3. **Manual verification:**
   ```bash
   # Before migration
   npx prisma migrate status
   
   # Attempt a migration that will fail
   # (e.g., add NOT NULL column to table with data)
   
   # After failure
   npx prisma migrate status
   # Database should be at previous migration
   
   # Verify no partial changes
   npx prisma db pull
   # Schema should match last successful migration
   ```

### Common Migration Scenarios

#### Adding a New Model

```prisma
// In prisma/schema.prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

```bash
npx prisma migrate dev --name create_notifications_table
```

#### Adding a Required Field to Existing Table

```prisma
// Option 1: Add with default value
model User {
  id        String   @id @default(uuid())
  email     String
  role      String   @default("user") // New field with default
  createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name add_user_role_with_default
```

#### Renaming a Column

```prisma
// Prisma will detect this as a drop + create
// To preserve data, use @map
model User {
  id           String @id @default(uuid())
  emailAddress String @map("email") // Maps to existing 'email' column
}
```

```bash
npx prisma migrate dev --name rename_email_to_email_address
```

#### Adding an Index

```prisma
model Metric {
  id        String   @id @default(uuid())
  siteId    String
  timestamp DateTime
  
  @@index([siteId, timestamp]) // Composite index for queries
}
```

```bash
npx prisma migrate dev --name add_metric_site_timestamp_index
```

### Migration Best Practices

1. **Review Generated SQL:**
   - Always check the generated migration file before applying
   - Located in `prisma/migrations/[timestamp]_[name]/migration.sql`
   - Verify it does what you expect

2. **Use Descriptive Names:**
   - Good: `add_user_avatar_field`, `create_notifications_table`
   - Bad: `update`, `changes`, `fix`

3. **Keep Migrations Small:**
   - One logical change per migration
   - Easier to review, test, and rollback if needed

4. **Test in Staging First:**
   - Apply migrations to staging environment
   - Run tests to verify everything works
   - Only then apply to production

5. **Backup Before Production Migrations:**
   ```bash
   # Create a database backup before applying migrations
   pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

6. **Handle Data Migrations Carefully:**
   - For complex data transformations, write custom migration scripts
   - Test with production-like data volumes
   - Consider doing data migrations in separate steps

7. **Monitor Migration Performance:**
   - Large migrations can lock tables
   - Consider maintenance windows for significant schema changes
   - Use `CONCURRENTLY` for index creation on large tables (requires custom SQL)

### Available Database Scripts

```bash
# Migration commands
npm run db:migrate              # Create and apply migrations (dev)
npm run db:migrate:deploy       # Apply migrations (production)
npm run db:migrate:status       # Check migration status
npm run db:migrate:reset        # Reset database (dev only - deletes all data!)

# Schema commands
npm run db:push                 # Push schema changes without migration (dev only)
npm run db:pull                 # Pull schema from database to schema.prisma

# Utility commands
npm run db:seed                 # Run seed script to populate test data
npm run db:studio               # Open Prisma Studio (database GUI)
npm run db:generate             # Regenerate Prisma Client
```

### Troubleshooting

#### Migration History Out of Sync

If your migration history doesn't match the database state:

```bash
# Check status
npx prisma migrate status

# Option 1: Mark migrations as applied (if they're already in the database)
npx prisma migrate resolve --applied "migration_name"

# Option 2: Mark migrations as rolled back (if they failed)
npx prisma migrate resolve --rolled-back "migration_name"
```

#### Schema Drift Detected

If Prisma detects your database schema doesn't match your migrations:

```bash
# Check what's different
npx prisma migrate status

# Option 1: Create a migration to fix drift
npx prisma migrate dev --name fix_schema_drift

# Option 2: Reset and reapply (dev only)
npx prisma migrate reset
```

#### Connection Issues

If migrations fail due to connection issues:

```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
npx prisma db pull

# Check database is running
pg_isready -h localhost -p 5432
```

### Migration File Structure

Each migration creates a directory with:

```
prisma/migrations/
├── 20231219023802_init/
│   └── migration.sql          # SQL commands to apply
├── 20231220154321_add_user_role/
│   └── migration.sql
└── migration_lock.toml         # Locks to specific database provider
```

The `_prisma_migrations` table tracks:
- `id` - Unique identifier
- `checksum` - Ensures migration file hasn't been modified
- `finished_at` - When migration completed
- `migration_name` - Name of the migration
- `logs` - Any output from the migration
- `rolled_back_at` - If migration was rolled back
- `started_at` - When migration started
- `applied_steps_count` - Number of steps executed

### Data Migrations

Sometimes you need to migrate data, not just schema. For complex data transformations:

#### Creating a Data Migration Script

1. **Create the script:**
   ```typescript
   // scripts/migrate-user-roles.ts
   import { PrismaClient } from '@prisma/client';
   
   const prisma = new PrismaClient();
   
   async function migrateUserRoles() {
     console.log('Starting user role migration...');
     
     // Update all users without a role
     const result = await prisma.user.updateMany({
       where: { role: null },
       data: { role: 'user' }
     });
     
     console.log(`Updated ${result.count} users`);
   }
   
   migrateUserRoles()
     .catch(console.error)
     .finally(() => prisma.$disconnect());
   ```

2. **Run the script:**
   ```bash
   npx ts-node scripts/migrate-user-roles.ts
   ```

3. **Verify the results:**
   ```bash
   npx prisma studio
   # Check that all users now have a role
   ```

#### Best Practices for Data Migrations

- **Test with production-like data volumes** - Performance matters
- **Run in a transaction** - Use `prisma.$transaction()` for atomicity
- **Add logging** - Track progress for large migrations
- **Create backups first** - Always backup before data migrations
- **Consider batching** - For large datasets, process in batches
- **Verify results** - Check data integrity after migration

### Testing Migration Workflow

To verify that migration failure handling works correctly:

```bash
# Run the migration failure test suite
npm run test:migration-failure
```

This test suite validates:
- ✅ Successful migration application
- ✅ Automatic rollback on constraint violations
- ✅ Automatic rollback on SQL syntax errors
- ✅ Migration history tracking
- ✅ Database state preservation after failures

**Test Results:** The test suite confirms that Prisma automatically rolls back failed migrations, leaving the database in its previous state with no partial changes applied.

**Additional Testing Resources:**
- `test-migration-failure.ts` - Automated test implementation with 4 test scenarios
- `test-migration-workflow.md` - Manual testing procedures and verification steps

### Requirements Coverage

This migration workflow satisfies all requirements from section 28:

- ✅ **28.1** - Generate migration files using Prisma (`npx prisma migrate dev`)
- ✅ **28.2** - Apply migrations in order (Prisma handles ordering automatically)
- ✅ **28.3** - Rollback on migration failure (automatic via transactions)
- ✅ **28.4** - Update migration history table (`_prisma_migrations` table)
- ✅ **28.5** - Recreate schema from migrations (`npx prisma migrate reset`)

### Migration Workflow Summary

#### For Developers (Local Development)

```bash
# 1. Modify schema
vim prisma/schema.prisma

# 2. Create and apply migration
npx prisma migrate dev --name descriptive_name

# 3. Verify changes
npx prisma studio

# 4. Test your application
npm test

# 5. Commit migration files
git add prisma/migrations/
git commit -m "Add migration: descriptive_name"
```

#### For DevOps (Production Deployment)

```bash
# 1. Backup database
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Check migration status
npx prisma migrate status

# 3. Apply pending migrations
npx prisma migrate deploy

# 4. Verify application health
curl http://your-api/health

# 5. Monitor for errors
tail -f /var/log/your-app/error.log
```

#### Key Takeaways

1. **Automatic Rollback:** Failed migrations automatically roll back - no manual intervention needed
2. **Use `migrate deploy` in production:** Never use `migrate dev` or `migrate reset` in production
3. **Test thoroughly:** Always test migrations in staging before production
4. **Backup first:** Always backup production database before migrations
5. **Review SQL:** Always review generated migration SQL before applying
6. **Track in Git:** Commit all migration files to version control
7. **Monitor execution:** Watch for errors during migration deployment

#### Additional Resources

- **Test Suite:** `npm run test:migration-failure` - Validates automatic rollback behavior
- **Test Documentation:** `test-migration-workflow.md` - Manual testing procedures
- **Test Implementation:** `test-migration-failure.ts` - Automated test scenarios
- **Prisma Documentation:** https://www.prisma.io/docs/concepts/components/prisma-migrate

### Common Migration Patterns

#### Pattern 1: Adding Optional Field

```prisma
// Step 1: Add optional field
model User {
  id       String  @id @default(uuid())
  email    String
  nickname String? // Optional
}
```

```bash
npx prisma migrate dev --name add_optional_nickname
```

#### Pattern 2: Adding Required Field with Default

```prisma
// Step 1: Add required field with default
model User {
  id    String @id @default(uuid())
  email String
  role  String @default("user") // Required with default
}
```

```bash
npx prisma migrate dev --name add_user_role_with_default
```

#### Pattern 3: Adding Required Field (Multi-Step)

```prisma
// Step 1: Add as optional
model User {
  id    String  @id @default(uuid())
  email String
  role  String? // Optional first
}
```

```bash
npx prisma migrate dev --name add_optional_role
```

```typescript
// Step 2: Populate data
// scripts/populate-user-roles.ts
await prisma.user.updateMany({
  where: { role: null },
  data: { role: 'user' }
});
```

```prisma
// Step 3: Make required
model User {
  id    String @id @default(uuid())
  email String
  role  String // Now required
}
```

```bash
npx prisma migrate dev --name make_role_required
```

#### Pattern 4: Renaming Field (Preserving Data)

```prisma
// Use @map to rename without data loss
model User {
  id           String @id @default(uuid())
  emailAddress String @map("email") // Renames in code, keeps DB column name
}
```

```bash
npx prisma migrate dev --name rename_email_field
```

#### Pattern 5: Adding Index for Performance

```prisma
model Metric {
  id        String   @id @default(uuid())
  siteId    String
  timestamp DateTime
  
  @@index([siteId, timestamp]) // Composite index
}
```

```bash
npx prisma migrate dev --name add_metric_query_index
```

#### Pattern 6: Adding Relationship

```prisma
model User {
  id            String         @id @default(uuid())
  email         String
  notifications Notification[] // One-to-many
}

model Notification {
  id     String @id @default(uuid())
  userId String
  text   String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

```bash
npx prisma migrate dev --name add_notifications_table
```

## Status

Currently a placeholder with a basic health check endpoint. Full API implementation coming in Week 3.
