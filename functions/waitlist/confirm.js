export async function onRequestGet(Context) {

  const { request: Request, env: Environment } = Context;
  const ConfirmationToken = new URL(Request.url).searchParams.get('token');

  if (!Environment.WAITLIST_DB || !ConfirmationToken) {

    return new Response('This confirmation link is invalid.', { status: 400 });

  }

  const ConfirmationTokenHash = await HashValue(ConfirmationToken);
  const ConfirmationResult = await Environment.WAITLIST_DB
    .prepare("UPDATE waitlist_subscribers SET status = 'confirmed', confirmed_at = ? WHERE confirmation_token_hash = ? AND status = 'unconfirmed'")
    .bind(new Date().toISOString(), ConfirmationTokenHash)
    .run();

  if (ConfirmationResult.meta.changes !== 1) {

    return new Response('This confirmation link has already been used or is invalid.', { status: 400 });

  }

  return Response.redirect(new URL('/waitlist-confirmed', Request.url).toString(), 302);

}

async function HashValue(Value) {

  const EncodedValue = new TextEncoder().encode(Value);
  const Digest = await crypto.subtle.digest('SHA-256', EncodedValue);

  return Array.from(new Uint8Array(Digest), (Byte) => Byte.toString(16).padStart(2, '0')).join('');

}
