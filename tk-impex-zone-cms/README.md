# TK Impex Zone — Supabase CMS website

A static corporate trading website for GitHub Pages with a Supabase-powered content management dashboard.

## Included
- Public pages: Home, Products, Product detail, How We Work, About Us, Contact
- Admin dashboard: sign-in, overview, product management, banner management, enquiry management
- Supabase PostgreSQL, Auth, Storage and Row Level Security schema
- Multiple product image uploads
- Published/draft controls
- Product SEO fields
- WhatsApp and website enquiry form

## 1. Configure Supabase
1. Create a Supabase project.
2. Open **SQL Editor** and run the complete `supabase/schema.sql` file.
3. Go to **Project Settings → API** and copy the Project URL and `anon` / publishable public key.
4. Edit `js/config.js` and replace:
   - `https://YOUR-PROJECT-REF.supabase.co`
   - `YOUR_SUPABASE_ANON_PUBLIC_KEY`
5. Confirm the WhatsApp number in `js/config.js` is correct (country code + number, digits only).

Never put the `service_role` key in this repository or browser code.

## 2. Create the admin users
1. In Supabase **Authentication → Users**, add the two administrator accounts.
2. Confirm each user has a row in `public.profiles` (the SQL trigger creates it).
3. Copy each user's UUID from Authentication → Users.
4. In SQL Editor, promote the primary account:
   ```sql
   update public.profiles set role='admin' where id='PRIMARY-USER-UUID';
   ```
5. Promote the second account as admin or editor:
   ```sql
   update public.profiles set role='editor' where id='SECOND-USER-UUID';
   ```
6. Do not enable public sign-up. Create team accounts manually from the Supabase dashboard.

## 3. Deploy to GitHub Pages
1. Download and extract this ZIP.
2. Back up your current repository before replacing files.
3. Copy the contents of this folder into the root of `tkimpexzone-spec.github.io`.
4. Preserve the repository's existing `CNAME` file if it contains your correct custom domain. This ZIP intentionally does not include a CNAME.
5. Commit and push to the branch configured in GitHub Pages (currently `main`, root).
6. Wait for the GitHub Pages Actions workflow to finish.

## 4. Admin dashboard
After deployment, open:
`https://YOUR-DOMAIN/admin/`

Sign in with one of the accounts created in Supabase. Only profiles with role `admin` or `editor` can access the CMS.

## 5. Add content
- Add banners in Admin → Banners.
- Add products in Admin → Products.
- Set a product as Featured to show it on the homepage.
- Publish a product or banner to make it visible publicly.
- Add product specifications as JSON, for example:
  ```json
  {
    "Moisture": "14% max",
    "Broken grains": "1% max",
    "Packaging": "25 kg / 50 kg"
  }
  ```
- Product gallery images are uploaded to Supabase Storage.

## 6. Important implementation notes / current limitations
- The admin UI currently supports product and banner management, enquiry status updates and dashboard counts.
- Categories and divisions are seeded in SQL. A dedicated category/division editor can be added in a later iteration; products can be assigned to seeded categories.
- The first published banner by sort order is used as the homepage hero. Division-specific banner display and separate mobile image rendering are not yet implemented in this starter.
- Product SEO fields are saved and used for the product detail page when JavaScript loads. GitHub Pages is static hosting; for strongest SEO/social previews, consider prerendering or moving to a server-rendered frontend later.
- Public enquiry insertion is protected by basic field validation and RLS. Add CAPTCHA/edge-function rate limiting before large-scale public campaigns.
- Uploaded images are public-read. Do not upload confidential documents.
- Admin access is managed in Supabase Auth and the `profiles` table. Do not allow users to self-assign roles.

## 7. Troubleshooting
- **Supabase not configured:** check `js/config.js` and ensure the URL and anon key are correct.
- **Admin login works but access denied:** set the user's `profiles.role` to `admin` or `editor`.
- **Image upload denied:** check the storage policies and ensure the signed-in user has an authorised profile.
- **Products not visible:** check `is_published=true`, division/category assignment and browser console errors.
- **404 on GitHub Pages:** verify `index.html` is in the repository root and Pages is publishing the correct branch and folder.

## 8. Security checklist
- Only use the Supabase anon/public key in `js/config.js`.
- Never commit passwords, service-role keys or private tokens.
- Keep RLS enabled on every table.
- Create admin accounts manually.
- Preserve the existing custom-domain `CNAME` file.
