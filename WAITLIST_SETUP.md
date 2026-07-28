# Waitlist Setup

The live site posts to the custom Cloudflare waitlist endpoint. It will show a setup message until the Cloudflare database, spam-protection, and email-sending bindings are configured.

When enabled, the custom waitlist will store subscribers in Cloudflare D1. It rejects repeat email addresses, verifies a Cloudflare Turnstile token on the server, rate-limits requests, and requires a one-time email confirmation before an address becomes confirmed.

Use [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md) to complete the Cloudflare dashboard configuration and switch the live form safely.
