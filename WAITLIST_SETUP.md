# Waitlist Setup

The Tether waitlist uses MailerLite form `44238230`. Its embedded form sends entries directly to the MailerLite subscriber list.

Before publishing, confirm these MailerLite form settings:

1. Keep reCAPTCHA enabled.
2. Keep double opt-in enabled, so only people who confirm from their inbox become active subscribers.
3. Deploy the site and submit a test email address. Confirm that it reaches the confirmation-email step and appears as an active subscriber only after confirmation.

The list is stored in MailerLite under Subscribers. Export the relevant subscriber group from the Groups tab when you need a CSV.
