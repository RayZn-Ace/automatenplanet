CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percent', -- 'percent' | 'fixed' | 'test'
  discount_value integer NOT NULL DEFAULT 0,     -- Prozent oder Cent (netto)
  is_test boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  free_shipping boolean NOT NULL DEFAULT false,
  min_subtotal_net_cents integer NOT NULL DEFAULT 0,
  max_redemptions integer,
  redemptions integer NOT NULL DEFAULT 0,
  starts_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX coupons_code_key ON public.coupons (lower(code));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders
  ADD COLUMN coupon_code text NOT NULL DEFAULT '',
  ADD COLUMN discount_net_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN is_test boolean NOT NULL DEFAULT false;

INSERT INTO public.coupons (code, description, discount_type, discount_value, is_test, free_shipping)
VALUES ('testadmin817', 'Interner Testcode: loest eine Testbestellung mit 0,01 EUR aus', 'test', 0, true, true);