
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- has_role: usada por policies (SECURITY DEFINER). Permitir apenas authenticated.
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

-- handle_new_user: trigger only
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
