-- Migration 001: Add slug column to providers
-- slug is the canonical lookup key; used by seed_providers for idempotent upserts.
ALTER TABLE providers ADD COLUMN slug TEXT;
ALTER TABLE providers ADD COLUMN logo_path TEXT;
ALTER TABLE providers ADD COLUMN account_url TEXT;
ALTER TABLE providers ADD COLUMN billing_url TEXT;
ALTER TABLE providers ADD COLUMN link_notes TEXT;
ALTER TABLE providers ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1
