-- Migration 004: Unique index on (provider_id, slug, billing_interval).
-- SQLite treats each NULL as distinct, so legacy rows with NULL slug/billing_interval
-- do not conflict with each other or with newly seeded rows.
CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_unique
ON plans (provider_id, slug, billing_interval)
