# Gopu & Aavani — wedding invitation

A mobile-first wedding website for Gopu Kunjumon and Aavani L.H. It is a static site with no build step, paid API, database, or subscription. It keeps the couple’s story in Gopu’s voice without adding unprovided personal memories.

## Preview

Open `index.html` in a modern browser. For a realistic local website preview, run a static server from this folder (for example, `python -m http.server 8000`) and visit `http://localhost:8000`.

## Wedding information included

- Wedding ceremony: Monday, 16 November 2026; 1202 Thulam 30; muhurtham 9:42 AM–10:10 AM; Cosmo Convention Centre, Vavvakavu, Karunagappally.
- Wedding reception: Monday, 16 November 2026, 6:00 PM–9:00 PM; ST. ALPHONSA PARISH HALL, Ambika Market, Vaikom.
- Groom: Gopu Kunjumon, son of Mr. Kunjumon and Mrs. Bindhumol; Gokulam, Ambika Market P.O., Vaikom; calls to 9995769171 and 8921159008.
- Bride: Aavani L.H, daughter of Mr. Harikumar R and Mrs. Liji L.G; Haristree, Adinadu North P.O., Karunagappally.
- Additional note: “Sharing the happiness: Dear & Near”; groom’s party leaves at 6:30 AM.

The map links search Google Maps for each supplied venue and address. The phone links open the guest’s phone dialer. No departure location was supplied, so the 6:30 AM announcement does not imply one.

## Personalize

- Edit the invitation wording, locations, family names, phone numbers, and visible wedding details directly in `index.html`.
- Edit the `wedding` object at the top of `script.js` to update the countdown date, names, and invitation date. `ceremony` uses an explicit India Standard Time offset (`+05:30`).
- The eight original couple and family photographs are in `images/` and are used directly with relative website paths. The opening portrait is `photo_5968711194103189351_w.jpg`; two story photographs and five distinct gallery selections use the others. No originals were edited or replaced. The gallery opens a full-screen viewer; tap/click, Escape, and the previous/next controls work.
- The page uses a real couple photograph for Open Graph and Twitter link previews. `share-card.png` is an optional typographic alternative if you prefer not to show a photograph in a preview.
- The background music is `audio/wedding-music.mp3`. Replace that file to change the track; keep the same filename, or update the path in `script.js`. Guests start and pause it with the SOUND button, since phones block autoplay. The Pages workflow includes the `audio/` folder in the deployed site.

## Free hosting and sharing

The repository includes `.github/workflows/pages.yml`, which publishes this static site to GitHub Pages on every push to `main`. It uses the official Pages Actions workflow and needs no build command. The site is at `https://amarnadhp1998-lgtm.github.io/gopu-aavani-wedding/`.

The WhatsApp share button uses the phone’s native share sheet when supported and falls back to a WhatsApp share link. The Open Graph and Twitter preview tags point to the expected GitHub Pages URL and selected couple photo. If you choose another repository name or account, update those URLs in `index.html`. Preview caches may take time to refresh after the first deployment.

## Activate the “Send Your Wishes” memory book

The wishes feature is built for a static GitHub Pages site using a Supabase Edge Function + Postgres and Cloudflare Turnstile. It does not save anything in the browser: until the service is configured, the page clearly says the memory book is being prepared and does not claim a wish was submitted. After setup, every guest message is saved as **pending**; only wishes you approve are shown in public. The service-role key and Turnstile secret stay in Supabase, never in this repository.

1. Create a Supabase project on the Free plan. Copy the project URL from **Project Settings → API**.
2. In **SQL Editor**, run the complete script in `supabase/migrations/20261022_wedding_wishes.sql`. It creates the private-by-default wishes table. Do not add public insert policies.
3. In **Edge Functions**, create a function named `wishes`, paste `supabase/functions/wishes/index.ts`, and deploy it. In the function settings, disable **Verify JWT** so guests can use it without signing in. The function itself enforces the site origin and Turnstile check. Supabase provides its service-role key to the function runtime; never copy that key into the website.
4. Create a Cloudflare Turnstile widget on the Free plan. Allow the hostname `amarnadhp1998-lgtm.github.io` (no `https://` and no project path). Keep the returned **site key** for the website and add the **secret key** to Supabase **Edge Function secrets** as `TURNSTILE_SECRET_KEY`.
5. Edit `wishes-config.js`: set `functionUrl` to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/wishes` and `turnstileSiteKey` to the Turnstile **site key**. These two values are public browser configuration; do not put any secret key here.
6. Commit and push to `main`. GitHub Actions will redeploy the site. Open the public URL, submit a test wish, then in Supabase **Table Editor → wedding_wishes** change its `status` from `pending` to `approved`. Reload the site and verify it appears in the wall. Delete the test row afterward if you do not want to keep it.

To review real guest notes, open the table in the Supabase dashboard. Set `status` to `approved` to publish, or `rejected` to keep it private. Pending and rejected notes are never returned to the public page. Do not share dashboard access or service keys with guests. The form asks permission before publishing the sender’s name and message; do not approve anything a guest did not consent to share.

The wishes feature includes 60-character names, 500-character notes, server-side validation, an idempotency ID for safe retries, a hidden honeypot, Cloudflare’s server-verified Turnstile challenge, same-origin checks, a 6 KB request cap, and a private moderation step. User text is inserted using DOM text nodes. The function exposes only approved notes in its public response. These controls reduce bot submissions and XSS risk; moderation is still the family’s responsibility.

The free tiers are suitable for a small wedding guest list, but are not a contractual uptime guarantee. Supabase Free currently includes 500 MB database and 500,000 Edge Function calls per month; projects with low activity may pause after seven days and need to be resumed in the dashboard. Cloudflare Turnstile has a free plan. Check current provider limits before relying on the memory book long term. Keep a copy/export of approved wishes if you want to preserve them permanently.

There is no RSVP form. No RSVP email was supplied, so the site does not contain a fake RSVP destination.

Google Fonts are loaded remotely; system font fallbacks keep the page readable without them. Wedding photos and music are self-hosted with the site, the hero loads eagerly, and the gallery images load lazily. The site includes responsive layouts, mobile navigation, a live countdown, reduced-motion support, accessible labels and headings, click-to-call contacts, venue directions, a full-screen photo viewer, WhatsApp sharing, and guest-controlled background music.
