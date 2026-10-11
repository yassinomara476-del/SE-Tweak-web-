# SE Tweaker Website — Final Package

A premium, responsive static website for SE Tweaker. The PRO optimizer and Free Tools are clearly presented as separate apps. The owner admin console is under `/admin/` and protected by server-side role checks in Supabase Edge Function `se-license`.

## Included
- `index.html` — landing page, products, features, pricing and FAQ
- `pro.html`, `free-tools.html`, `download.html`, `license.html` — separate product/support pages
- `privacy.html`, `terms.html` — legal starter pages (review before sales)
- `admin/` — owner license management console
- `config.js` — public links only; set your actual Discord invite here before launch
- `.github/workflows/pages.yml` — deploys to GitHub Pages when configured

## Prices
- 1 Month: EGP 300
- 3 Months: EGP 800
- Lifetime current-version license: EGP 1,000
- Future updates are separate. One license = one device.

## Before public launch
1. Edit `config.js` and set `discordInvite` to your actual `https://discord.gg/...` or `https://discord.com/invite/...` invite. Only set download URLs for builds that have been tested and uploaded. PRO is intended to be delivered privately, so keep `proDownloadUrl` empty if you will send it manually.
2. Verify the Supabase Edge Function `se-license` is deployed and that the owner account has server-controlled `app_metadata.role = admin`. Use the private app source's `scripts/set-admin-role.mjs`; never put the service-role/secret key in this repo.
3. Set GitHub Pages source to **GitHub Actions** in repository Settings → Pages. The included workflow deploys the site.
4. Visit `/admin/` and test sign-in, license creation, revocation, device reset, update entitlement and logs before selling.
5. Test on mobile, review legal text for your business, and do not claim guaranteed FPS.

## Admin URL
After publishing: `https://yassinomara476-del.github.io/SE-Tweak-web-/admin/`

## Data & privacy
Optional website analytics is sent only after explicit consent. It may record connection IP, a random browser token, path/referrer, user agent and timestamp. The public page only uses a Supabase publishable key; no secret is present. License data and logs are only accessed by the server-side Edge Function and require admin authorization for administrative actions.

## Accuracy
This site intentionally does not host a public PRO installer. The Free Tools page is separate from PRO; only enable its download URL once a separate tested executable exists. FPS targets and graphics choices depend on hardware, GameLoop and game-version availability.
