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

Apply `migrations/202611250001_personal_finance_owner_encryption.sql` before opening the page. This table grants access only to the authenticated owner at AAL2; transaction fields are AES-GCM encrypted in the browser, and summaries are calculated after decryption in memory. The encryption passphrase is never uploaded or persisted. Losing it makes those finance records unrecoverable. The page enrolls/challenges TOTP MFA and verifies AAL2; keep TOTP enrollment enabled in Supabase Auth.

Tesseract.js worker, WebAssembly core, and Thai/English trained data are bundled under `public/ocr/` and served from the same origin. The OCR worker uses `cacheMethod: none`; receipt images are passed directly to the local worker, never uploaded, and no object URLs are created. Cloudflare Pages uses `public/_headers` and `public/_redirects`; the existing Firebase Hosting configuration remains separate. Deploy the chosen hosting target only after checking its response headers and verifying the Supabase migration is applied.

The Firebase Hosting response headers are configured in the repository's `firebase.json`; they take effect only after a Hosting deploy.
