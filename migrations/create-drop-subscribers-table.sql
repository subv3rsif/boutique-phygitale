-- Migration: Create drop_subscribers table
-- Date: 2026-04-17
-- Description: Table for storing email subscriptions to drop notifications

-- Create the table
CREATE TABLE IF NOT EXISTS drop_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  confirmation_token VARCHAR(64),
  subscribed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  unsubscribe_token VARCHAR(64) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_drop_subscribers_email
ON drop_subscribers(email);

CREATE INDEX IF NOT EXISTS idx_drop_subscribers_confirmed
ON drop_subscribers(confirmed);

-- Add comments for documentation
COMMENT ON TABLE drop_subscribers IS
'Stores email addresses for drop (limited edition) notifications';

COMMENT ON COLUMN drop_subscribers.email IS
'Subscriber email address (unique, lowercase)';

COMMENT ON COLUMN drop_subscribers.confirmed IS
'Whether the subscriber has confirmed their email address';

COMMENT ON COLUMN drop_subscribers.unsubscribe_token IS
'Token for one-click unsubscribe links';
