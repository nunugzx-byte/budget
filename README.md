# £ Budget Tracker — synced private version

This version adds Supabase email/password login and cloud sync, while retaining a local browser backup.

## 1. Create a Supabase project
Create a project at Supabase. In the project, open the SQL editor and run the full contents of `supabase-setup.sql`.

## 2. Add your project details
Open `config.js` and replace:
- `YOUR_SUPABASE_URL` with your Project URL
- `YOUR_SUPABASE_PUBLISHABLE_KEY` with your publishable key (an anon key also works for older projects)

Do **not** put a `service_role` or secret key in a browser website.

## 3. Upload to GitHub
Upload/replace these files in the repository root:
- `index.html`
- `style.css`
- `app.js`
- `config.js`

`supabase-setup.sql` does not need to be hosted; it is only for running once in Supabase.

## 4. First login
Open your GitHub Pages tracker, choose **Create my account**, and use your email and a password. If email confirmation is enabled in Supabase, confirm the email and then sign in.

Once signed in, the same monthly data will load on any device where you sign in with that account.

## Existing local budget data
The app keeps a local backup. On the first cloud login for a month that has no cloud row yet, it uploads the local copy from that device. If you already have important data, sign in first on the device that currently has the most complete version.
