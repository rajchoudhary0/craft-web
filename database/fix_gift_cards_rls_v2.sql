-- Fix Gift Cards RLS Policy
-- Accessing auth.users directly in a policy often fails due to permissions.
-- We should use auth.jwt() ->> 'email' instead.

DROP POLICY IF EXISTS "View Access Gift Cards" ON gift_cards;

CREATE POLICY "View Access Gift Cards" 
ON gift_cards FOR SELECT 
TO authenticated 
USING ( 
  purchaser_id = auth.uid() OR 
  recipient_email = (auth.jwt() ->> 'email') OR
  is_admin_or_manager()
);

SELECT 'Gift Cards RLS policy fixed successfully' as result;
