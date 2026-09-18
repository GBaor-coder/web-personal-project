-- Add image_url column to links table for Bio/Affiliate link imagery
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Optional: add comment for documentation
COMMENT ON COLUMN public.links.image_url IS 'Public URL of the uploaded thumbnail displayed on the miniature CRT screen in /links. Falls back to icon_name when NULL.';