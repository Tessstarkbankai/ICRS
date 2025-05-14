/*
  # Fix Complaint Submission Policy

  1. Changes
    - Drop existing insert policy
    - Create new simplified insert policy that:
      - Allows public submissions
      - Validates required fields
      - Handles both anonymous and identified submissions correctly
      
  2. Security
    - Maintains data validation
    - Ensures either all or no identification fields are provided
    - Keeps email format validation
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Enable complaint submissions" ON complaints;

-- Create new simplified insert policy
CREATE POLICY "Enable complaint submissions" ON complaints
FOR INSERT TO public
WITH CHECK (
  -- Required fields must be present
  title IS NOT NULL AND
  description IS NOT NULL AND
  (
    -- For anonymous submissions
    (is_anonymous = true AND student_name IS NULL AND student_email IS NULL)
    OR
    -- For identified submissions
    (is_anonymous = false AND student_name IS NOT NULL AND student_email IS NOT NULL AND
     student_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
  )
);