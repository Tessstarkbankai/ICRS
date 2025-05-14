/*
  # Fix RLS policies for complaint submissions

  1. Changes
    - Drop existing INSERT policy that has incorrect conditions
    - Create new INSERT policy with proper validation for both anonymous and identified submissions
  
  2. Security
    - Ensures proper validation of required fields
    - Maintains data integrity for both anonymous and identified submissions
    - Prevents submission of incomplete or invalid complaints
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Enable complaint submissions" ON complaints;

-- Create new INSERT policy with proper conditions
CREATE POLICY "Enable complaint submissions" ON complaints
FOR INSERT TO public
WITH CHECK (
  -- Require title and description for all submissions
  title IS NOT NULL AND
  description IS NOT NULL AND
  (
    -- For anonymous submissions
    (
      is_anonymous = true AND
      student_name IS NULL AND
      student_email IS NULL
    ) OR
    -- For identified submissions
    (
      is_anonymous = false AND
      student_name IS NOT NULL AND
      student_email IS NOT NULL AND
      student_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
  )
);