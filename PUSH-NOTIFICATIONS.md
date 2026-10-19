# Laundry push-notification setup

The application code is ready, but push delivery needs these one-time deployment steps.

1. Run [supabase-migration-push-notifications.sql](supabase-migration-push-notifications.sql) in Supabase SQL Editor.
2. Install the deployment dependency locally with `npm install`.
3. Generate a VAPID key pair with:

   ```bash
   npx web-push generate-vapid-keys
   ```

4. In Vercel → Project → Settings → Environment Variables, add the following for Production, Preview, and Development:

   - `SUPABASE_URL`: your Supabase project URL
   - `SUPABASE_ANON_KEY`: your project publishable/anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: your Supabase **service-role** key; never place this in frontend files
   - `VAPID_PUBLIC_KEY`: the generated public key
   - `VAPID_PRIVATE_KEY`: the generated private key
   - `VAPID_SUBJECT`: a contact URI, for example `mailto:admin@lnmiit.ac.in`

5. Deploy to Vercel. Open the deployed site over HTTPS, visit Laundry, enter a token, and choose **Enable alert**.

The staff panel triggers delivery after a successful Laundry status update. Push works after the browser or installed PWA is closed, unless the student disables browser notifications or removes the subscription.
