-- ============================================
-- Fix Storage Permissions - SAFE VERSION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create the 'images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create policies safely (using DO blocks to avoid errors if they exist)
-- We use specific names "Images *" to avoid conflicts with global policies

-- Policy: Public Read Access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Images Public Read'
    ) THEN
        CREATE POLICY "Images Public Read"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'images' );
    END IF;
END $$;

-- Policy: Authenticated Upload
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Images Auth Upload'
    ) THEN
        CREATE POLICY "Images Auth Upload"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'images' );
    END IF;
END $$;

-- Policy: Authenticated Update
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Images Auth Update'
    ) THEN
        CREATE POLICY "Images Auth Update"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING ( bucket_id = 'images' );
    END IF;
END $$;

-- Policy: Authenticated Delete
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Images Auth Delete'
    ) THEN
        CREATE POLICY "Images Auth Delete"
        ON storage.objects FOR DELETE
        TO authenticated
        USING ( bucket_id = 'images' );
    END IF;
END $$;

SELECT 'Storage permissions fixed safely!' as result;
