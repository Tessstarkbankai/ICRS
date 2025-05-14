/*
  # Create Storage Bucket for Resolution Images

  1. Changes
    - Create storage bucket for resolution images
    - Set up RLS policies for the bucket
  
  2. Security
    - Allow public read access to images
    - Allow authenticated users (admins) to upload images
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resolution-images', 'resolution-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to resolution images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resolution-images');

-- Policy to allow authenticated users (admins) to upload images
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resolution-images');

-- Policy to allow authenticated users (admins) to update/delete images
CREATE POLICY "Admin Modify Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resolution-images');

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resolution-images');