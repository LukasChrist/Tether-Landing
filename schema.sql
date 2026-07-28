-- Run this once against the Cloudflare D1 database before enabling the custom waitlist.
CREATE TABLE IF NOT EXISTS waitlist_subscribers (
  email TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('unconfirmed', 'confirmed')),
  confirmation_token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  confirmed_at TEXT
);

-- Keep only short-lived, salted IP hashes for request throttling.
CREATE TABLE IF NOT EXISTS waitlist_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started_at TEXT NOT NULL,
  request_count INTEGER NOT NULL
);
