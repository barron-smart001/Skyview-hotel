# Skyview Hotels — Next.js + Supabase + Paystack

Production-oriented hotel booking/property-management foundation.

## Stack
- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL + RLS
- Paystack server-side transaction initialization, callback verification and webhook confirmation
- Tailwind CSS v4
- Lucide icons

## 1. Install
```bash
npm install
npm run dev
```

## 2. Environment
Copy `.env.example` to `.env.local` and fill every `YOUR_...` value.

### YOUR WORK HERE — Supabase
1. Create/open your Supabase project.
2. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the Publishable key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Copy the server-only service role key into `SUPABASE_SERVICE_ROLE_KEY`.
5. Never commit `.env.local` or expose the service role key.

### YOUR WORK HERE — database
Open Supabase SQL Editor and run:
`supabase/001_initial_schema.sql`

### YOUR WORK HERE — Paystack
1. Create/open your Paystack account.
2. During development use the test secret/public keys.
3. Put the secret in `PAYSTACK_SECRET_KEY` and public key in `PAYSTACK_PUBLIC_KEY`.
4. Set `APP_URL` to your local/deployed URL.
5. Set `PAYSTACK_CALLBACK_URL` to `${APP_URL}/paystack/callback`.
6. In Paystack Dashboard set the webhook URL to `${APP_URL}/api/paystack/webhook`.

Paystack's secret key stays server-side. The app initializes transactions on the server and confirms successful payments through verification/webhook handling.

## 3. Create your first administrator
The signup trigger creates every account as `guest` by default. After creating your own account, run this in Supabase SQL Editor:
```sql
update public.profiles
set role = 'administrator'
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
```
Replace `YOUR_ADMIN_EMAIL` with the exact admin email.

## 4. Important production TODOs
- Replace demo room image URLs with Skyview's real images.
- Confirm final room names, prices, capacity and amenities.
- Add hotel address/contact/social details.
- Add exact cancellation/refund policy.
- Finish staff actions: check-in, check-out, walk-ins, room status, booking edits/cancellation.
- Add invoice/receipt generation.
- Add housekeeping and maintenance workflow.
- Add analytics/report queries.
- Add rate limiting and monitoring before public launch.
- Test Paystack with test cards and webhook events before switching to live keys.

## Booking/payment lifecycle
`pending_payment → confirmed → checked_in → checked_out`

Payment status is only changed by trusted server-side Paystack verification/webhook logic, not by a client-side success message.
