
CREATE TABLE public.bot_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.bot_users TO service_role;
ALTER TABLE public.bot_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bot_sessions (
  telegram_id BIGINT PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.bot_sessions TO service_role;
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  username TEXT,
  service TEXT NOT NULL,
  package TEXT NOT NULL,
  price_usd NUMERIC(12,2) NOT NULL,
  fasttrack_platform TEXT,
  contract_address TEXT,
  token_name TEXT,
  token_symbol TEXT,
  token_logo_url TEXT,
  token_chain TEXT,
  website TEXT,
  social_link TEXT,
  description TEXT,
  supply TEXT,
  pay_chain TEXT,
  pay_token TEXT,
  pay_amount_crypto NUMERIC(36,18),
  pay_address TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  telegram_id BIGINT NOT NULL,
  chain TEXT NOT NULL,
  address TEXT NOT NULL,
  encrypted_seed TEXT,
  encrypted_privkey TEXT,
  derivation_path TEXT,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purge_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours')
);
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_wallets_purge_at ON public.wallets(purge_at);
CREATE INDEX idx_orders_telegram_id ON public.orders(telegram_id);
