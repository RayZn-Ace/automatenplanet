REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated, anon;
DELETE FROM public.leads WHERE email = 'jk@webalarm.de' AND name = 'Test Lead';