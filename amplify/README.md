# Amplify SPA Routing

This folder contains redirect/rewrite configuration for AWS Amplify Hosting.

## Refreshing /platform (and other client-side routes)

To ensure refreshing `/platform`, `/chat`, and other SPA routes works:

1. Open **AWS Amplify Console** → Your App → **Hosting** → **Redirects and rewrites**
2. Add a rewrite rule (or use the JSON editor):
   - **Source:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - **Target:** `/index.html`
   - **Type:** Rewrite (200)

Or import the rules from `redirects.json` if your Amplify setup supports it.

Many Amplify apps have "Single page app (SPA) redirect" enabled by default, in which case `/platform` refresh may already work.
