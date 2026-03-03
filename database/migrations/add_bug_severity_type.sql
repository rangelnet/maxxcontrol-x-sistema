-- Migration: Add severity, type and context fields to bugs table
-- Date: 2024
-- Description: Extends bugs table to support crash monitoring system with severity levels, error types, and context data

-- Add new columns
ALTER TABLE bugs 
ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'error',
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'crash',
ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_type ON bugs(type);
CREATE INDEX IF NOT EXISTS idx_bugs_resolvido ON bugs(resolvido);

-- Add constraints to validate values
ALTER TABLE bugs 
ADD CONSTRAINT check_severity 
CHECK (severity IN ('critical', 'error', 'warning'));

ALTER TABLE bugs 
ADD CONSTRAINT check_type 
CHECK (type IN ('crash', 'navigation', 'player', 'api', 'ui', 'network'));

-- Update existing bugs with default values
UPDATE bugs 
SET severity = 'error', type = 'crash', context = '{}'::jsonb 
WHERE severity IS NULL OR type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN bugs.severity IS 'Error severity level: critical, error, or warning';
COMMENT ON COLUMN bugs.type IS 'Error type: crash, navigation, player, api, ui, or network';
COMMENT ON COLUMN bugs.context IS 'Additional context data as JSON (screen, action, memory, etc)';
