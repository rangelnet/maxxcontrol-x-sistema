-- Migration: Add IPTV cache columns to devices table
-- Description: Adds current_iptv_server_url and current_iptv_username columns for quick display in device list
-- Date: 2026-03-02

BEGIN;

-- Add IPTV cache columns
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS current_iptv_server_url TEXT NULL,
ADD COLUMN IF NOT EXISTS current_iptv_username TEXT NULL;

-- Add column comments
COMMENT ON COLUMN devices.current_iptv_server_url IS 
  'Cached IPTV server URL for quick display in device list. Updated when IPTV config is saved.';
COMMENT ON COLUMN devices.current_iptv_username IS 
  'Cached IPTV username for quick display in device list. Updated when IPTV config is saved.';

-- Populate cache from existing IPTV configurations
UPDATE devices d
SET 
  current_iptv_server_url = dic.xtream_url,
  current_iptv_username = dic.xtream_username
FROM device_iptv_config dic
WHERE d.id = dic.device_id;

-- Verify columns were added
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Check if columns exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'devices' 
    AND column_name = 'current_iptv_server_url'
  ) THEN
    RAISE EXCEPTION 'Failed to add current_iptv_server_url column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'devices' 
    AND column_name = 'current_iptv_username'
  ) THEN
    RAISE EXCEPTION 'Failed to add current_iptv_username column';
  END IF;

  -- Count how many devices have IPTV cache populated
  SELECT COUNT(*) INTO updated_count
  FROM devices
  WHERE current_iptv_server_url IS NOT NULL;

  RAISE NOTICE 'IPTV cache columns added successfully';
  RAISE NOTICE '% devices have IPTV configuration cached', updated_count;
END $$;

COMMIT;
