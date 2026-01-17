# 🚀 Supabase Database Setup Guide

## Step-by-Step Instructions

### 1. Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tqtzwqmeyvkozkrhptjf
2. Click on **SQL Editor** in the left sidebar (database icon)
3. Click **New Query** button

### 2. Run the Migration SQL

1. Open the file: `supabase_migration.sql` (located in the backend folder)
2. Copy ALL the contents of the file
3. Paste it into the Supabase SQL Editor
4. Click the **RUN** button (or press Ctrl+Enter)
5. Wait for it to complete - you should see "Database schema created successfully! 🎉"

**Important:** If you see any errors about existing types or tables, you can either:
- Drop the existing database objects first, OR
- Ignore errors about objects that already exist

### 3. Run the Seed Data SQL

1. Create another **New Query** in Supabase SQL Editor
2. Open the file: `supabase_seed.sql` (located in the backend folder)
3. Copy ALL the contents
4. Paste it into the new query window
5. Click **RUN**
6. You should see success messages with login credentials

### 4. Verify the Setup

Run this query to check if tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see tables like:
- users
- rides
- vehicles
- service_categories
- payments
- invoices
- etc.

### 5. Test User Credentials

After seeding, you'll have these test accounts:

| Role       | Email                                  | Password      |
|------------|----------------------------------------|---------------|
| Admin      | admin@compassionatemedirides.com       | Admin123!     |
| Dispatcher | dispatch@compassionatemedirides.com    | Dispatch123!  |
| Driver     | driver@compassionatemedirides.com      | Driver123!    |
| Customer   | customer@example.com                   | Customer123!  |

### 6. Start Your Backend Application

Once the database is set up:

```bash
cd backend
npm start
```

The application should now connect to Supabase successfully!

### 7. Check Connection

Test the connection by visiting:
- http://localhost:1000/api (Swagger documentation)
- Try logging in with one of the test accounts

## Troubleshooting

### If you see "relation already exists" errors:
This means some tables already exist. You can either:
1. Drop all tables and re-run the migration
2. Or skip the migration and just run the seed data

### To drop all tables (⚠️ WARNING: This deletes all data):
```sql
-- Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run the migration.sql and seed.sql

### If you need to reset just the data:
```sql
-- Delete all data but keep tables
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE service_categories CASCADE;
TRUNCATE TABLE service_areas CASCADE;
```

Then re-run just the seed.sql

## Next Steps

✅ Database schema created
✅ Seed data inserted
✅ Test users ready
✅ Service categories configured

Now you can:
1. Start the backend server
2. Test the API endpoints
3. Connect your frontend
4. Create new rides, users, and test the system!

## Files Generated

- `supabase_migration.sql` - Full database schema
- `supabase_seed.sql` - Initial seed data
- `SUPABASE_SETUP_GUIDE.md` - This guide

## Support

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Verify your connection string in `.env`
3. Make sure the database is active (not paused)
4. Check that all SQL commands completed successfully

Happy coding! 🎉
