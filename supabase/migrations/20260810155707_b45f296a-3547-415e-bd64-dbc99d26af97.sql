CREATE TABLE public.mail_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT[] NOT NULL DEFAULT '{}',
  cc_email TEXT[] NOT NULL DEFAULT '{}',
  subject TEXT,
  text_body TEXT,
  html_body TEXT,
  snippet TEXT,
  message_id TEXT,
  in_reply_to TEXT,
  provider_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'received',
  error_message TEXT,
  raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX mail_messages_created_at_idx ON public.mail_messages (created_at DESC);
CREATE INDEX mail_messages_direction_idx ON public.mail_messages (direction);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mail_messages TO authenticated;
GRANT ALL ON public.mail_messages TO service_role;

ALTER TABLE public.mail_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mail messages"
ON public.mail_messages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_mail_messages_updated_at
BEFORE UPDATE ON public.mail_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mail_identities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mail_identities TO authenticated;
GRANT ALL ON public.mail_identities TO service_role;

ALTER TABLE public.mail_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mail identities"
ON public.mail_identities FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_mail_identities_updated_at
BEFORE UPDATE ON public.mail_identities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.mail_identities (email, display_name, is_default) VALUES
  ('kontakt@automatenplanet.com', 'Automatenplanet', true),
  ('info@automatenplanet.com', 'Automatenplanet', false),
  ('support@automatenplanet.com', 'Automatenplanet Support', false);