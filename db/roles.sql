-- Roles & Grants for Distributed AirTicket (PostgreSQL)

BEGIN;

-- Create roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'airline_ops') THEN
    CREATE ROLE airline_ops NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agent') THEN
    CREATE ROLE agent NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'customer') THEN
    CREATE ROLE customer NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'auditor') THEN
    CREATE ROLE auditor NOINHERIT;
  END IF;
END$$;

-- Public schema views (read-only for most roles)
GRANT USAGE ON SCHEMA public TO airline_ops, agent, customer, auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO airline_ops, agent, customer, auditor;

-- Site schemas usage
GRANT USAGE ON SCHEMA hn TO airline_ops, agent, auditor;
GRANT USAGE ON SCHEMA dn TO airline_ops, agent, auditor;
GRANT USAGE ON SCHEMA hcm TO airline_ops, agent, auditor;

-- Airline Ops: manage flights/tickets/bookings at all sites
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA hn TO airline_ops;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA dn TO airline_ops;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA hcm TO airline_ops;

-- Agent: create bookings/tickets/payments; read flights
GRANT SELECT ON hn.flight, dn.flight, hcm.flight TO agent;
GRANT SELECT, INSERT, UPDATE ON hn.booking, hn.ticket, hn.payment TO agent;
GRANT SELECT, INSERT, UPDATE ON dn.booking, dn.ticket, dn.payment TO agent;
GRANT SELECT, INSERT, UPDATE ON hcm.booking, hcm.ticket, hcm.payment TO agent;

-- Customer: read-only public views
GRANT SELECT ON public.flight, public.ticket, public.booking TO customer;

-- Auditor: read-only across sites; limited access to sensitive info
GRANT SELECT ON ALL TABLES IN SCHEMA hn TO auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA dn TO auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA hcm TO auditor;

-- Secure schema: only auditor (read) and airline_ops (none) -> restrict sensitive data
GRANT USAGE ON SCHEMA sec TO auditor;
GRANT SELECT ON sec.customer_private TO auditor;
REVOKE ALL ON sec.customer_private FROM airline_ops, agent, customer;

COMMIT;