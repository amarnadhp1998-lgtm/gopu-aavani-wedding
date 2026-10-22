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

## Free hosting and sharing

The repository includes `.github/workflows/pages.yml`, which publishes this static site to GitHub Pages on every push to `main`. It uses the official Pages Actions workflow and needs no build command. Create a public repository named `gopu-aavani-wedding` under `amarnadhp1998-lgtm`, push these files on `main`, and choose **GitHub Actions** as the Pages source in repository Settings → Pages. The expected URL is `https://amarnadhp1998-lgtm.github.io/gopu-aavani-wedding/`. GitHub Free Pages is free for public repositories; a custom domain is optional and domain registration may cost money.

The WhatsApp share button uses the phone’s native share sheet when supported and falls back to a WhatsApp share link. The Open Graph and Twitter preview tags point to the expected GitHub Pages URL and selected couple photo. If you choose another repository name or account, update those URLs in `index.html`. Preview caches may take time to refresh after the first deployment.

There is no RSVP form or response database. No RSVP email was supplied, so the site does not contain a fake RSVP destination. If you want online RSVPs later, add a free form or Google Form and review its free-tier limits and privacy terms.

Google Fonts are loaded remotely; system font fallbacks keep the page readable without them. Wedding photos are self-hosted with the site, the hero loads eagerly, and the gallery images load lazily. The site includes responsive layouts, mobile navigation, a live countdown, reduced-motion support, accessible labels and headings, click-to-call contacts, venue directions, a full-screen photo viewer, WhatsApp sharing, and a guest-controlled browser-generated chime loop.
