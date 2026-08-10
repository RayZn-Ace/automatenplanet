INSERT INTO public.user_roles (user_id, role)
VALUES
  ('acfdcda3-7adc-433e-a4ab-5917c2101ca1', 'admin'),
  ('67b3caed-15b8-4bf4-9db6-26f898f74e4d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;