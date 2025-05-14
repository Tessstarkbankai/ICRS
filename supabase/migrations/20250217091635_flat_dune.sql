/*
  # Update complaint submission policies

  1. Changes
    - Drop existing insert policy
    - Create new insert policy with proper checks
    - Add policy for public to read resolved complaints

  2. Security
    - Allow public to insert complaints
    - Add validation for required fields
    - Allow public to read resolved complaints
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Enable anonymous submissions" ON complaints;

-- Create new insert policy with proper checks
CREATE POLICY "Enable complaint submissions"
ON complaints FOR INSERT
TO public
WITH CHECK (
  title IS NOT NULL AND
  description IS NOT NULL AND
  (
    (is_anonymous = true AND student_name IS NULL AND student_email IS NULL) OR
    (is_anonymous = false AND student_name IS NOT NULL AND student_email IS NOT NULL)
  )
);

-- Add policy for public to read resolved complaints
CREATE POLICY "Public can read resolved complaints"
ON complaints FOR SELECT
TO public
USING (status = 'RESOLVED');