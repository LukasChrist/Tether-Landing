const MAXIMUM_REQUESTS_PER_WINDOW = 3;
const RATE_LIMIT_WINDOW_MILLISECONDS = 10 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(Context) {

  const { request: Request, env: Environment } = Context;
  const ConfigurationError = GetConfigurationError(Environment);

  if (ConfigurationError) {

    return JsonResponse({ message: 'The waitlist is not ready yet.' }, 503);

  }

  const FormData = await Request.formData();
  const EmailAddress = String(FormData.get('email') || '').trim().toLowerCase();
  const HoneypotValue = String(FormData.get('website') || '').trim();
  const TurnstileToken = String(FormData.get('cf-turnstile-response') || '').trim();

  // Bots often populate every field; accept silently so they cannot tune their attacks.
  if (HoneypotValue) {

    return JsonResponse({ message: 'Check your inbox to confirm your spot.' });

  }

  if (!EMAIL_PATTERN.test(EmailAddress)) {

    return JsonResponse({ message: 'Enter a valid email address.' }, 400);

  }

  const VisitorIpAddress = Request.headers.get('CF-Connecting-IP') || '';
  const IsRateLimited = await CheckRateLimit(Environment, VisitorIpAddress);

  if (IsRateLimited) {

    return JsonResponse({ message: 'Please wait a few minutes before trying again.' }, 429);

  }

  const IsTurnstileValid = await ValidateTurnstile(Environment.TURNSTILE_SECRET_KEY, TurnstileToken, VisitorIpAddress);

  if (!IsTurnstileValid) {

    return JsonResponse({ message: 'Please complete the security check and try again.' }, 400);

  }

  const ExistingSubscriber = await Environment.WAITLIST_DB
    .prepare('SELECT status FROM waitlist_subscribers WHERE email = ?')
    .bind(EmailAddress)
    .first();

  if (ExistingSubscriber) {

    return JsonResponse({ message: 'That email is already on the waitlist. Check your inbox if it still needs confirmation.' });

  }

  const ConfirmationToken = CreateConfirmationToken();
  const ConfirmationTokenHash = await HashValue(ConfirmationToken);
  const CreatedAt = new Date().toISOString();

  await Environment.WAITLIST_DB
    .prepare('INSERT INTO waitlist_subscribers (email, status, confirmation_token_hash, created_at) VALUES (?, ?, ?, ?)')
    .bind(EmailAddress, 'unconfirmed', ConfirmationTokenHash, CreatedAt)
    .run();

  const ConfirmationUrl = new URL('/waitlist/confirm', Environment.WAITLIST_ORIGIN);
  ConfirmationUrl.searchParams.set('token', ConfirmationToken);

  try {

    await Environment.EMAIL.send({
      to: EmailAddress,
      from: Environment.WAITLIST_FROM_EMAIL,
      subject: 'Confirm your Tether waitlist spot',
      text: `Confirm your Tether waitlist spot: ${ConfirmationUrl.toString()}`,
      html: `<p>Confirm your Tether waitlist spot:</p><p><a href="${ConfirmationUrl.toString()}">Confirm my spot</a></p>`,
    });

  } catch (Error) {

    // Do not leave an email in an unconfirmable state if the send fails.
    await Environment.WAITLIST_DB
      .prepare('DELETE FROM waitlist_subscribers WHERE email = ?')
      .bind(EmailAddress)
      .run();

    console.error('Waitlist confirmation email failed to send.', Error);
    return JsonResponse({ message: 'We could not send the confirmation email. Please try again shortly.' }, 503);

  }

  return JsonResponse({ message: 'Check your inbox to confirm your spot.' });

}

function GetConfigurationError(Environment) {

  if (!Environment.WAITLIST_DB || !Environment.EMAIL || !Environment.TURNSTILE_SECRET_KEY || !Environment.WAITLIST_FROM_EMAIL || !Environment.WAITLIST_ORIGIN) {

    return 'Missing one or more waitlist bindings.';

  }

  return null;

}

async function CheckRateLimit(Environment, VisitorIpAddress) {

  const CurrentTime = new Date();
  const WindowStartedAt = new Date(CurrentTime.getTime() - RATE_LIMIT_WINDOW_MILLISECONDS).toISOString();
  const IpHash = await HashValue(`${Environment.RATE_LIMIT_SALT}:${VisitorIpAddress}`);

  await Environment.WAITLIST_DB
    .prepare('DELETE FROM waitlist_rate_limits WHERE window_started_at < ?')
    .bind(WindowStartedAt)
    .run();

  const ExistingRateLimit = await Environment.WAITLIST_DB
    .prepare('SELECT request_count FROM waitlist_rate_limits WHERE ip_hash = ?')
    .bind(IpHash)
    .first();

  if (ExistingRateLimit && ExistingRateLimit.request_count >= MAXIMUM_REQUESTS_PER_WINDOW) {

    return true;

  }

  if (ExistingRateLimit) {

    await Environment.WAITLIST_DB
      .prepare('UPDATE waitlist_rate_limits SET request_count = request_count + 1 WHERE ip_hash = ?')
      .bind(IpHash)
      .run();

  } else {

    await Environment.WAITLIST_DB
      .prepare('INSERT INTO waitlist_rate_limits (ip_hash, window_started_at, request_count) VALUES (?, ?, ?)')
      .bind(IpHash, CurrentTime.toISOString(), 1)
      .run();

  }

  return false;

}

async function ValidateTurnstile(SecretKey, Token, VisitorIpAddress) {

  if (!Token) {

    return false;

  }

  const RequestBody = new FormData();
  RequestBody.append('secret', SecretKey);
  RequestBody.append('response', Token);

  if (VisitorIpAddress) {

    RequestBody.append('remoteip', VisitorIpAddress);

  }

  const Response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: RequestBody,
  });
  const ValidationResult = await Response.json();

  return Response.ok && ValidationResult.success === true;

}

function CreateConfirmationToken() {

  const TokenBytes = new Uint8Array(32);
  crypto.getRandomValues(TokenBytes);

  return Array.from(TokenBytes, (Byte) => Byte.toString(16).padStart(2, '0')).join('');

}

async function HashValue(Value) {

  const EncodedValue = new TextEncoder().encode(Value);
  const Digest = await crypto.subtle.digest('SHA-256', EncodedValue);

  return Array.from(new Uint8Array(Digest), (Byte) => Byte.toString(16).padStart(2, '0')).join('');

}

function JsonResponse(Body, Status = 200) {

  return Response.json(Body, {
    status: Status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });

}
