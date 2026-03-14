-- Migration: add source_handle / target_handle to edges table
ALTER TABLE edges
  ADD COLUMN IF NOT EXISTS source_handle TEXT,
  ADD COLUMN IF NOT EXISTS target_handle TEXT;
