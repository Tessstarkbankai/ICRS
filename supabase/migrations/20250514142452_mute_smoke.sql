/*
  # Fix complaints table RLS policies

  1. Changes
    - Remove overly complex INSERT policy
    - Add simpler INSERT policy that allows both anonymous and identified submissions
    - Keep existing SELECT and UPDATE policies

  2. Security
    - Maintains security by validating required fields
    - Ensures data consistency for anonymous vs identified submissions
*/

-- Drop the existing complex INSERT policy
DROP POLICY IF EXISTS "Enable anonymous submissions" ON complaints;

-- Create new simplified INSERT policy
CREATE POLICY "Allow complaint submissions" ON complaints
FOR INSERT TO public
WITH CHECK (
  -- Require title and description
  title IS NOT NULL AND
  description IS NOT NULL AND
  (
    -- For anonymous submissions
    (is_anonymous = true AND student_name IS NULL AND student_email IS NULL) OR
    -- For identified submissions
    (is_anonymous = false AND student_name IS NOT NULL AND student_email IS NOT NULL)
  )
);