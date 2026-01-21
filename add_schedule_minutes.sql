-- Add start_minute and end_minute columns to schedule_blocks table
ALTER TABLE schedule_blocks 
ADD COLUMN IF NOT EXISTS start_minute INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS end_minute INTEGER DEFAULT 0;

-- Update existing records to have 0 minutes
UPDATE schedule_blocks 
SET start_minute = 0, end_minute = 0
WHERE start_minute IS NULL OR end_minute IS NULL;
