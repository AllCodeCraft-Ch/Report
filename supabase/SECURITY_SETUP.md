# Security setup before release

The client now signs in through Supabase Auth. Data and the `media` Storage bucket require a user whose trusted `app_metadata.role` is `admin`.

## Supabase dashboard setup

1. In **Authentication → Users**, create or invite the administrator account that will be used on the login page.
2. Set that user's **App Metadata** to include `{ "role": "admin" }`. Do not put the role in User Metadata; users can edit User Metadata themselves.
3. Disable public sign-ups in **Authentication → Settings** unless account creation is intentionally required. The database policies still require the trusted admin role either way.
4. Review the SQL in `migrations/202611240003_require_admin_auth.sql`, then apply it in the Supabase SQL Editor. It locks down `daily_reports`, `calendar_notes`, `provincial_trips`, `provincial_trip_cutoffs`, and the `media` bucket.
5. Sign in once with the admin account after setting App Metadata so its JWT contains the admin claim.
6. In **Authentication → Settings**, keep public sign-ups disabled, require a strong password, enable leaked-password protection if available, and review allowed redirect URLs so only the production app and required local development URLs are present.
7. Enable MFA for the administrator account in Supabase Auth and require it for administrative access if the project plan and current login flow support that policy.
8. Review **Database → Settings → Data API** and disable automatic exposure of new tables unless the app needs it. Keep RLS and explicit grants on every exposed table.

## Release order

The repository's client now uses Supabase Auth and requires a trusted `app_metadata.role = 'admin'` claim. The SQL migration and Hosting headers are source changes only until separately applied/deployed. Before enabling the migration on the live project, provision and verify the administrator account and plan a coordinated release of the migration and client so access is not interrupted. After release, verify that signed-out requests are denied for all four data tables and the `media` bucket, while the administrator can use the app. Never put a Supabase service-role key in the browser or a `VITE_` variable.

The Hosting configuration adds a restrictive Content Security Policy, clickjacking protection, MIME sniffing protection, a referrer policy, and a permissions policy. The Content Security Policy allows only this app's Supabase project for API, image, and media access, plus Google Fonts used by the interface.

## Personal Finance

Apply `migrations/202611250001_personal_finance_owner_encryption.sql`, `migrations/20261125114345_simplify_personal_finance.sql`, and `migrations/20261125115730_remove_personal_finance_mfa_gate.sql` before releasing the simplified page. New rows store the amount in integer satang, the creation timestamp, and the user-entered detail. The finance page uses the shared six-digit code `101268` on every device as a simple page-entry prompt. It is not a secret security boundary; Supabase Auth and owner-only RLS remain the actual database access controls. Finance values are stored as regular database fields rather than client-side encrypted payloads. Date and month summaries are calculated in the browser using Asia/Bangkok. Receipt scanning and the separate encryption vault are not part of the page.

Cloudflare Pages uses `public/_headers` and `public/_redirects`; the existing Firebase Hosting configuration remains separate. Deploy the chosen hosting target after the migration is applied.

The Firebase Hosting response headers are configured in the repository's `firebase.json`; they take effect only after a Hosting deploy.
