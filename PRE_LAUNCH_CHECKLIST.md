# Tether Pre-Launch Checklist

## Waitlist Foundation

- [x] Custom Cloudflare Pages Function is prepared in `functions/api/waitlist.js`.
- [x] A unique email record prevents duplicate signups.
- [x] A confirmation token is stored as a hash, never in plaintext.
- [x] A confirmation route marks subscribers as confirmed only after they use their one-time link.
- [x] A salted IP hash limits each visitor to three requests every ten minutes.
- [x] The existing confirmation page is ready at `/waitlist-confirmed`.

## Before Enabling The Custom Form

- [ ] Upgrade to Cloudflare Workers Paid: $5/month includes 3,000 outbound emails.
- [ ] Create a D1 database named `tether-waitlist`.
- [ ] Run `schema.sql` against that D1 database.
- [ ] In Cloudflare Pages, bind the D1 database as `WAITLIST_DB`.
- [ ] Add an Email Sending binding named `EMAIL`.
- [ ] Verify a sending address such as `waitlist@yourdomain.com` and set `WAITLIST_FROM_EMAIL` to it.
- [ ] Create a Cloudflare Turnstile widget restricted to your production hostname.
- [ ] Set these Pages secrets: `TURNSTILE_SECRET_KEY` and a random `RATE_LIMIT_SALT`.
- [ ] Set the Pages variable `WAITLIST_ORIGIN` to `https://tether-landing.pages.dev`.
- [x] Replace the MailerLite form with the custom Cloudflare form.
- [ ] Add the public Turnstile sitekey to `index.html`.
- [ ] Test a new email address: confirmation email, confirmation link, and final confirmation page.
- [ ] Test the same email again: it must not create another subscriber record or send another confirmation email.
- [ ] Test four quick submissions from one browser: the fourth must be rate-limited.

## Launch

- [x] Remove the MailerLite embed scripts.
- [ ] Update the privacy policy to name Cloudflare as the waitlist processor.
- [ ] Export or back up the confirmed D1 subscriber list before contacting the waitlist.
