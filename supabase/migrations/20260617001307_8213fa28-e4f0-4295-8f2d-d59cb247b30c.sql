
-- 1) Profiles: remove public read; allow owner + admin read
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_self_read ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- 2) Settings: restrict public read to known public keys only
DROP POLICY IF EXISTS settings_public_read ON public.settings;
CREATE POLICY settings_public_read ON public.settings FOR SELECT
  USING (key IN ('adsense','site_public'));

-- 3) user_roles: explicit admin-only write policies
DROP POLICY IF EXISTS user_roles_admin_write ON public.user_roles;
CREATE POLICY user_roles_admin_write ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Remove has_role from public-read policies so we can revoke EXECUTE from anon/authenticated.
--    Admins/editors still see drafts via the ALL admin_write policy (which covers SELECT).
DROP POLICY IF EXISTS posts_public_read_published ON public.posts;
CREATE POLICY posts_public_read_published ON public.posts FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS ads_public_read_active ON public.ads;
CREATE POLICY ads_public_read_active ON public.ads FOR SELECT
  USING (is_active = true);

-- 5) Lock down has_role: callable only by the database itself (used inside SECURITY DEFINER context of policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
