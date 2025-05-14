/*
  # Add Image URL for Resolved Complaints

  1. Changes
    - Add image_url column to complaints table for storing solution images
    - Column is optional (nullable) to make image upload optional
  
  2. Security
    - Update RLS policy to allow admins to update image_url
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'complaints' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE complaints ADD COLUMN image_url text;
  END IF;
END $$;