# Waitlist Setup

The Tether waitlist is configured to submit email addresses to the Formspree form at `https://formspree.io/f/mzdnojwy`. The page includes a Formspree `_gotcha` honeypot and a one-minute browser cooldown to deter basic automated and repeat submissions.

Before publishing, complete these Formspree settings:

1. In the form's Settings, confirm CAPTCHA is enabled under Spam protection.
2. Set Restrict to domain to the published Tether domain, so the form rejects submissions from other sites.
3. Deploy the site and submit a test email address. Confirm that the submission appears in Formspree and the notification reaches the configured inbox.

The list is stored in the Formspree dashboard for this form, under its Submissions tab. The form submits only an email address and a subject line. You can export the list as CSV or JSON, or connect it to a spreadsheet or email-marketing provider from the Formspree dashboard.
