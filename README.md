This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Portfolio visit counter

The header displays total page visits. Each page entry, refresh, or in-site navigation increments the shared counter, including visits from the site owner. The counter uses Supabase and shows as unavailable until configured.

1. Run [`supabase/portfolio-visit-counter.sql`](./supabase/portfolio-visit-counter.sql) in the Supabase SQL Editor.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the Vercel project environment variables. For local development, put them in `.env.local`.
   - These values are designed to be publishable. The database table remains protected by row-level security, and the public key can only execute the counter function granted by the SQL script.
3. Redeploy the site.

The counter counts page views, not unique people. Repeated visits, bots, and refreshes are counted; it does not identify visitors. The total is stored in Supabase and is shared across devices.

## Private contact inbox

The Contact page saves submissions to Supabase. The private owner dashboard is available at `/login` and `/admin`; there is intentionally no public signup or admin navigation link.

1. In the Supabase SQL Editor, run [`supabase/portfolio-inbox.sql`](./supabase/portfolio-inbox.sql).
2. In Supabase, open **Authentication → Users → Add user**. Create the owner account using an email address and a new, unique password. Confirm the email if prompted.
3. Copy the owner user's UUID from the Users list. In the SQL Editor, run this statement with the real UUID:
   ```sql
   insert into public.portfolio_admins (user_id)
   values ('PASTE-OWNER-AUTH-USER-UUID-HERE')
   on conflict (user_id) do nothing;
   ```
   This allowlists that account as the portfolio admin. A successful password login without this step will show “Owner access not enabled yet.”
4. In Supabase Authentication settings, disable public signups if this project does not need visitor accounts. The admin UUID allowlist and database policies still protect inbox access.
5. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set in the Vercel project, then redeploy.
6. Visit `/login`, sign in with the owner email and password, and manage messages at `/admin`.

The SQL permits anonymous visitors to insert validated contact messages, but only the allowlisted admin can read or update them. The form includes a honeypot and server-side validation. For stronger spam prevention and email alerts, add a CAPTCHA provider and a transactional email service in a later step.

## Portfolio content manager

The private `/admin` dashboard can manage projects and certificates. You can add, edit, publish, hide, reorder, feature projects on the homepage, and upload JPG, PNG, or WebP images up to 5 MB. Published changes appear on the public Projects and Certificates pages; unpublished entries remain available in the admin.

1. Run [`supabase/portfolio-content.sql`](./supabase/portfolio-content.sql) in the Supabase SQL Editor **after** [`supabase/portfolio-inbox.sql`](./supabase/portfolio-inbox.sql), because the content policies use its `is_portfolio_admin()` function.
2. Sign in at `/login`, open `/admin`, and choose **Projects & certificates**.
3. If a collection is empty, choose **Import existing** to copy the current static entries into Supabase. This import is only available while that collection has no records, so it will not overwrite managed edits.
4. Add or edit items. Use **Published** to control public visibility and **Feature on homepage** to choose homepage projects. Uploaded files are served from the public `portfolio-media` Storage bucket; only the allowlisted owner can upload them.

Before the SQL is run or while the content tables are unavailable, public pages keep showing the existing static portfolio content. After running the SQL, import each collection from `/admin` before expecting its entries to appear publicly; an initialized collection with no published entries intentionally shows no entries.

## Homepage and profile manager

The admin dashboard also manages the homepage introduction, profile image, About section and statistics, and featured achievement. Updates are saved to Supabase and displayed on the homepage. Image uploads use the existing public `portfolio-media` bucket.

1. Run [`supabase/portfolio-homepage.sql`](./supabase/portfolio-homepage.sql) in Supabase after [`supabase/portfolio-inbox.sql`](./supabase/portfolio-inbox.sql). The image upload feature also requires [`supabase/portfolio-content.sql`](./supabase/portfolio-content.sql) for its Storage bucket and upload policy.
2. Sign in, open `/admin`, and choose **Homepage & profile**.
3. Edit the sections and save. Uploading a new profile photo adds it to the saved Profile image library without deleting previous uploads; use **Choose saved image** to switch back to an earlier upload or the original `/profile.png`. The existing homepage content is prefilled as a starting point.
