
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Analytics events
CREATE TABLE public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  page_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'other',
  browser TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER,
  question_id TEXT,
  question_title TEXT,
  answer_option TEXT,
  value_cents INTEGER,
  currency TEXT,
  ip_hash TEXT NOT NULL DEFAULT '',
  variant TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ae_created_at ON public.analytics_events (created_at);
CREATE INDEX ae_session ON public.analytics_events (session_id);
CREATE INDEX ae_event_type ON public.analytics_events (event_type);
CREATE INDEX ae_page_id ON public.analytics_events (page_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Inserts only via edge function (service role bypasses RLS); deny client inserts by not creating a policy.
CREATE POLICY "Admins can view all events"
ON public.analytics_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
