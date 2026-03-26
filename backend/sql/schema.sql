-- Golf Charity Subscription Platform backend schema (Supabase PostgreSQL)
create extension if not exists "pgcrypto";

create table if not exists charities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  category text not null,
  website text,
  logo_url text,
  total_received numeric(12,2) not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  selected_charity_id uuid not null references charities(id),
  charity_contribution_pct int not null check (charity_contribution_pct between 10 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan_type text not null check (plan_type in ('monthly', 'yearly')),
  status text not null check (status in ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  amount numeric(10,2) not null default 0,
  currency text not null default 'usd',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  score int not null check (score between 0 and 72),
  date_played date not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_scores_user_created on scores(user_id, date_played desc, created_at desc);

create table if not exists draw_results (
  id uuid primary key default gen_random_uuid(),
  draw_month text not null unique,
  mode text not null check (mode in ('random', 'weighted')),
  winner_user_id uuid not null references users(id),
  jackpot_amount numeric(12,2) not null,
  jackpot_rollover numeric(12,2) not null default 0,
  is_published boolean not null default false,
  executed_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  draw_result_id uuid not null references draw_results(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists winner_proofs (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null references payouts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  proof_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  verified_by uuid references users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function enforce_last_five_scores()
returns trigger
language plpgsql
as $$
begin
  delete from scores
  where id in (
    select s.id
    from scores s
    where s.user_id = new.user_id
    order by s.date_played desc, s.created_at desc
    offset 5
  );

  return new;
end;
$$;

drop trigger if exists trg_scores_keep_five on scores;
create trigger trg_scores_keep_five
after insert on scores
for each row execute function enforce_last_five_scores();
