
DROP POLICY "Creator can insert fixtures" ON public.tournament_fixtures;

CREATE POLICY "Tournament creator can insert fixtures" ON public.tournament_fixtures 
FOR INSERT TO authenticated 
WITH CHECK (
  tournament_id IN (
    SELECT t.id FROM public.tournaments t WHERE t.created_by = auth.uid()
  )
);
