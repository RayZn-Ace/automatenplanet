ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'in_stock';
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'in_stock';

ALTER TABLE public.products ADD CONSTRAINT products_availability_check
  CHECK (availability IN ('in_stock','out_of_stock','preorder','backorder'));
ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_availability_check
  CHECK (availability IN ('in_stock','out_of_stock','preorder','backorder'));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS vat_id text NOT NULL DEFAULT '';