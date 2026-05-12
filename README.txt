Simple birthday website for Nandika

How to open:
1. Open index.html in your browser.
2. That is all. No npm, no build, no install.

How to change the childhood photo:
1. Put her photo inside the photos folder.
2. Rename it to childhood-photo.jpg or childhood-photo.png.
3. In index.html, change:
   photos/childhood-photo.svg
   to:
   photos/childhood-photo.jpg

How wishes work:
- Without setup, wishes save in the visitor's own browser only.
- To make wishes readable by everyone online, create a free Supabase project and make one table.
- This is required for public/shared wishes. A plain HTML file cannot permanently store wishes for all visitors by itself.

Supabase table SQL:

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz default now()
);

alter table public.wishes enable row level security;

create policy "Anyone can read wishes"
on public.wishes for select
using (true);

create policy "Anyone can post wishes"
on public.wishes for insert
with check (true);

alter publication supabase_realtime add table public.wishes;

Then open config.js and paste your values here:
window.NANDIKA_SITE_CONFIG = {
  SUPABASE_URL: "your project url",
  SUPABASE_ANON_KEY: "your anon public key"
};

After this, every visitor will read wishes from the same Supabase table.

Countdown:
- The countdown automatically counts to 14 May.
- After 14 May passes, it counts to 14 May next year.

How to edit the blog:
- Open index.html.
- Edit the text inside the "A little blog" section.

How to put it online:
- Upload the docs folder to GitHub Pages, or use /docs as your GitHub Pages publishing source.
- See SHARED-WISHES-AND-GITHUB.txt for the exact steps.
