/*
  # Fix complaints table RLS policies

  1. Changes
    - Drop and recreate the INSERT policy with simpler validation
    - Policy ensures either:
      a) Anonymous submissions have no student info
      b) Named submissions have required student info
    
  2. Security
    - Maintains data integrity requirements
    - Allows both anonymous and named submissions
    - Prevents invalid combinations of fields
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Enable complaint submissions" ON complaints;

-- Create new simplified policy
CREATE POLICY "Enable complaint submissions" ON complaints
FOR INSERT TO public
WITH CHECK (
  -- Basic required fields
  title IS NOT NULL AND 
  description IS NOT NULL AND
  -- Validate anonymous vs named submissions
  (
    (is_anonymous = true AND student_name IS NULL AND student_email IS NULL) OR
    (is_anonymous = false AND student_name IS NOT NULL AND student_email IS NOT NULL)
  )
);