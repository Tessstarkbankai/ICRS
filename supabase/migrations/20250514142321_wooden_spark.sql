/*
  # Fix complaints table RLS policies

  1. Changes
    - Drop existing "Enable anonymous submissions" policy
    - Create new policy to properly enable anonymous submissions
    
  2. Security
    - Maintains RLS enabled on complaints table
    - Allows public (unauthenticated) users to submit complaints
    - Ensures basic validation of required fields
*/

-- Drop the existing policy that's not working
DROP POLICY IF EXISTS "Enable anonymous submissions" ON complaints;

-- Create new policy with proper conditions
CREATE POLICY "Enable anonymous submissions"
ON complaints
FOR INSERT
TO public
WITH CHECK (
  -- Ensure required fields are present
  title IS NOT NULL 
  AND description IS NOT NULL
  -- For anonymous submissions, ensure student info is null
  AND (
    (is_anonymous = true AND student_name IS NULL AND student_email IS NULL)
    OR
    -- For non-anonymous submissions, ensure student info is provided
    (is_anonymous = false AND student_name IS NOT NULL AND student_email IS NOT NULL)
  )
);