/*
  # Initial Schema Setup for Complaint Management System

  1. New Tables
    - complaints
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - status (enum: PENDING, IN_PROGRESS, RESOLVED)
      - is_anonymous (boolean)
      - student_name (text, nullable)
      - student_email (text, nullable)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on complaints table
    - Add policies for public submission and admin access
*/

-- Create enum type for complaint status
CREATE TYPE complaint_status AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED');

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    status complaint_status DEFAULT 'PENDING',
    is_anonymous boolean DEFAULT false,
    student_name text,
    student_email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Policy for anonymous submissions (anyone can create)
CREATE POLICY "Enable anonymous submissions"
ON complaints FOR INSERT
TO public
WITH CHECK (true);

-- Policy for admin to read all complaints
CREATE POLICY "Admins can read all complaints"
ON complaints FOR SELECT
TO authenticated
USING (true);

-- Policy for admin to update status
CREATE POLICY "Admins can update status"
ON complaints FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);