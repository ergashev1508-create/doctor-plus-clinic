# Supabase setup

1. Create a Supabase project.
2. Open `SQL Editor`.
3. Paste and run `supabase/schema.sql`.
4. In Render, add these environment variables:

```text
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Use the service role key only on the Render server. Do not put it in frontend code.

When these variables are present, the backend stores doctors, bookings, patients, notifications, admin users, reviews, and settings in Supabase. Without them, it keeps using `clinic.json` for local testing.
