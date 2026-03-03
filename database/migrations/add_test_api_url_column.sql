-- Migration: Add test_api_url column to devices table
-- Description: Adds test_api_url column for custom chatbot API URL configuration per device
-- Date: 2026-03-02

BEGIN;

-- Add test_api_url column
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS test_api_url TEXT NULL;

-- Add column comment
COMMENT ON COLUMN devices.test_api_url IS 
  'Custom chatbot API URL for test credential generation. NULL uses default URL (https://painel.masterbins.com/api/chatbot/bOxLAQLZ7a/ANKWPKDPRq).';

-- Verify column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'devices' 
    AND column_name = 'test_api_url'
  ) THEN
    RAISE NOTICE 'Column test_api_url added successfully to devices table';
  ELSE
    RAISE EXCEPTION 'Failed to add test_api_url column';
  END IF;
END $$;

COMMIT;
