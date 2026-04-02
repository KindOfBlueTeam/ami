-- Migration 002: Enforce uniqueness on provider slug
-- SQLite allows multiple NULLs in a unique index, so this is safe to apply
-- before slugs are backfilled. Slugs are populated by seed_providers.
CREATE UNIQUE INDEX IF NOT EXISTS uq_providers_slug ON providers (slug)
