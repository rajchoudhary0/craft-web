-- Function to update product rating and review count
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
BEGIN
  -- Determine product_id based on operation
  IF (TG_OP = 'DELETE') THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  -- Update the product stats
  UPDATE products
  SET 
    rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
      FROM reviews 
      WHERE product_id = target_product_id 
      AND is_approved = true
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM reviews 
      WHERE product_id = target_product_id 
      AND is_approved = true
    )
  WHERE id = target_product_id;

  RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to handle INSERT, UPDATE, and DELETE
DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_product_rating();

-- Manually recalculate ratings for all products to fix existing data
UPDATE products p
SET 
  rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
    FROM reviews r 
    WHERE r.product_id = p.id 
    AND r.is_approved = true
  ),
  reviews_count = (
    SELECT COUNT(*)
    FROM reviews r 
    WHERE r.product_id = p.id 
    AND r.is_approved = true
  );
