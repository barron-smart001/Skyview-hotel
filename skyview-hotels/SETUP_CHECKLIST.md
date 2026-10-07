# Skyview Hotels — YOUR WORK HERE

## Must fill before running
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (server only)
- [ ] `PAYSTACK_SECRET_KEY`
- [ ] `PAYSTACK_PUBLIC_KEY`
- [ ] `APP_URL`
- [ ] `PAYSTACK_CALLBACK_URL`

## Must configure in Supabase
- [ ] Run `supabase/001_initial_schema.sql`
- [ ] Create your first account
- [ ] Promote it to `administrator`
- [ ] Enable/choose your email confirmation policy
- [ ] Replace demo rooms/prices/images

## Must configure in Paystack
- [ ] Test keys first
- [ ] Webhook: `/api/paystack/webhook`
- [ ] Callback: `/paystack/callback`
- [ ] Test a successful payment
- [ ] Test a failed/abandoned payment
- [ ] Confirm webhook reaches the deployed app

## Business decisions you must provide
- [ ] Final hotel name/logo/address/phone/email
- [ ] Real room inventory and room numbers
- [ ] Final room prices
- [ ] Check-in time
- [ ] Check-out time
- [ ] Cancellation/refund rules
- [ ] Taxes/service charges, if any
- [ ] Extra guest pricing, if any
- [ ] Deposit/full-payment rule
- [ ] Walk-in booking rules
- [ ] Staff permission matrix
- [ ] Housekeeping statuses/workflow

## Production hardening still required
- [ ] Rate limiting on public booking/payment endpoints
- [ ] Error monitoring
- [ ] Automated tests
- [ ] Payment reconciliation/reporting
- [ ] Invoice/receipt PDFs
- [ ] Backup/recovery procedure
