-- Off-chain database schema for Blockchain Hybrid (PostgreSQL)

BEGIN;

-- Customers (PII, store encrypted at application level if needed)
CREATE TABLE IF NOT EXISTS customer (
  customer_id  SERIAL PRIMARY KEY,
  full_name    VARCHAR(160) NOT NULL,
  email        VARCHAR(160) NOT NULL,
  phone        VARCHAR(32),
  address      VARCHAR(240),
  national_id  VARCHAR(48)
);

-- Payment mirror (link to on-chain tx)
CREATE TABLE IF NOT EXISTS payment (
  payment_id   SERIAL PRIMARY KEY,
  ticket_id    VARCHAR(66) NOT NULL,       -- on-chain ticketId (uint256 -> string)
  tx_hash      VARCHAR(80) NOT NULL,       -- on-chain transaction hash
  provider     VARCHAR(32) NOT NULL,       -- VNPay/Momo/Card/On-chain
  amount       NUMERIC(12,2) NOT NULL,
  currency     VARCHAR(8) NOT NULL DEFAULT 'VND',
  status       VARCHAR(24) NOT NULL,       -- PENDING/SUCCESS/FAILED
  method       VARCHAR(24) NOT NULL,       -- CARD/WALLET/ONCHAIN
  paid_at      TIMESTAMPTZ
);

-- Flight mirror (on-chain)
CREATE TABLE IF NOT EXISTS flight_mirror (
  flight_id    VARCHAR(66) PRIMARY KEY,    -- on-chain id/hash
  flight_code  VARCHAR(32) NOT NULL,
  origin       VARCHAR(8)  NOT NULL,
  destination  VARCHAR(8)  NOT NULL,
  departure    TIMESTAMPTZ NOT NULL,
  arrival      TIMESTAMPTZ NOT NULL,
  airplane_hash VARCHAR(66),
  last_event_tx VARCHAR(80)
);

-- Ticket mirror (on-chain)
CREATE TABLE IF NOT EXISTS ticket_mirror (
  ticket_id    VARCHAR(66) PRIMARY KEY,    -- on-chain id
  flight_id    VARCHAR(66) NOT NULL,
  owner        VARCHAR(66) NOT NULL,       -- wallet addr
  class        VARCHAR(16) NOT NULL,
  status       VARCHAR(24) NOT NULL,       -- ISSUED/PURCHASED/TRANSFERRED/CANCELED
  price        NUMERIC(12,2) NOT NULL,
  last_event_tx VARCHAR(80),
  UNIQUE(ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_flight ON ticket_mirror (flight_id);
CREATE INDEX IF NOT EXISTS idx_payment_ticket ON payment (ticket_id);

COMMIT;