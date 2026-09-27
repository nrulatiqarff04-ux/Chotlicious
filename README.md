# Chotlicious V7

## What's new
- All standard jars are now RM8.00 each.
- Added Limited Edition **Cookie Crunch**.
- Added persistent order recording through Supabase.
- Added Seller Dashboard with email/password login.
- Seller dashboard shows order count, total jars, total sales, order details and CSV export.
- Added order status controls: New / Preparing / Completed / Cancelled.

## Important: GitHub Pages alone cannot store shared orders
The customer site is still hosted on GitHub Pages, but browser localStorage cannot collect orders from multiple customers into one shared seller view. V7 therefore uses Supabase as the small backend database + authentication layer.

### Setup
1. Create a free Supabase project.
2. Open SQL Editor and run `supabase-setup.sql`.
3. Create your seller account under Authentication > Users.
4. Copy that user's UUID and uncomment/edit the final INSERT in `supabase-setup.sql`, then run it.
5. In Supabase Project Settings > API, copy the Project URL and publishable/anon key into `config.js`.
6. Upload the V7 files to the same GitHub repository.
7. Seller dashboard: `https://nrulatiqarff04-ux.github.io/Chotlicious/seller.html`

### Security note
Only the public/publishable/anon key belongs in `config.js`. Never put a Supabase service_role/secret key in GitHub Pages. Row Level Security keeps orders readable only by registered seller accounts.
