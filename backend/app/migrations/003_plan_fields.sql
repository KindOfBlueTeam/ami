-- Migration 003: Add new canonical fields to the plans table.
-- Legacy columns (price_monthly, price_annual_total, is_free) are preserved
-- for backward compatibility with existing subscriptions and API code.
ALTER TABLE plans ADD COLUMN slug TEXT;
ALTER TABLE plans ADD COLUMN billing_interval TEXT;
ALTER TABLE plans ADD COLUMN default_price_usd REAL;
ALTER TABLE plans ADD COLUMN monthly_equivalent_usd REAL;
ALTER TABLE plans ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1
