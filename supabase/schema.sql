-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text not null,
  role text not null check (role in ('therapist', 'client')),
  created_at timestamptz default now() not null
);

-- Therapist profiles
create table public.therapist_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade unique not null,
  license_type text,
  specializations text[] default '{}'
);

-- Client profiles
create table public.client_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade unique not null,
  therapist_id uuid references public.users(id) not null,
  name text not null
);

-- Sessions
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.client_profiles(id) on delete cascade not null,
  therapist_id uuid references public.users(id) not null,
  session_date timestamptz not null,
  session_number int not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Transcripts
create table public.transcripts (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade unique not null,
  content text not null,
  source text not null check (source in ('upload', 'paste')),
  created_at timestamptz default now() not null
);

-- Treatment plans
create table public.treatment_plans (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.client_profiles(id) on delete cascade not null,
  therapist_id uuid references public.users(id) not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  current_version_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Treatment plan versions
create table public.treatment_plan_versions (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.treatment_plans(id) on delete cascade not null,
  version_number int not null,
  session_id uuid references public.sessions(id),
  therapist_view jsonb not null,
  client_view jsonb not null,
  created_at timestamptz default now() not null
);

-- Add FK for current_version after versions table exists
alter table public.treatment_plans
  add constraint fk_current_version
  foreign key (current_version_id)
  references public.treatment_plan_versions(id);

-- Safety flags
create table public.safety_flags (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  plan_version_id uuid references public.treatment_plan_versions(id),
  flag_type text not null check (flag_type in ('crisis', 'self_harm', 'harm_to_others')),
  severity text not null check (severity in ('low', 'medium', 'high')),
  excerpt text not null,
  created_at timestamptz default now() not null
);

-- Session summaries
create table public.session_summaries (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade unique not null,
  therapist_summary text not null,
  client_summary text not null,
  created_at timestamptz default now() not null
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.therapist_profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.transcripts enable row level security;
alter table public.treatment_plans enable row level security;
alter table public.treatment_plan_versions enable row level security;
alter table public.safety_flags enable row level security;
alter table public.session_summaries enable row level security;

-- RLS Policies: Users can read their own data
create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

-- Therapists can read their clients
create policy "Therapists can read their clients" on public.client_profiles
  for select using (therapist_id = auth.uid());

create policy "Therapists can insert clients" on public.client_profiles
  for insert with check (therapist_id = auth.uid());

-- Clients can read own profile
create policy "Clients can read own profile" on public.client_profiles
  for select using (user_id = auth.uid());

-- Therapist profiles
create policy "Therapists can read own profile" on public.therapist_profiles
  for select using (user_id = auth.uid());

-- Sessions: therapists see their sessions, clients see their sessions
create policy "Therapists can read their sessions" on public.sessions
  for select using (therapist_id = auth.uid());

create policy "Therapists can insert sessions" on public.sessions
  for insert with check (therapist_id = auth.uid());

create policy "Clients can read their sessions" on public.sessions
  for select using (
    client_id in (select id from public.client_profiles where user_id = auth.uid())
  );

-- Transcripts: via session access
create policy "Therapists can read transcripts" on public.transcripts
  for select using (
    session_id in (select id from public.sessions where therapist_id = auth.uid())
  );

create policy "Therapists can insert transcripts" on public.transcripts
  for insert with check (
    session_id in (select id from public.sessions where therapist_id = auth.uid())
  );

-- Treatment plans
create policy "Therapists can manage their plans" on public.treatment_plans
  for all using (therapist_id = auth.uid());

create policy "Clients can read their plans" on public.treatment_plans
  for select using (
    client_id in (select id from public.client_profiles where user_id = auth.uid())
  );

-- Plan versions
create policy "Therapists can manage plan versions" on public.treatment_plan_versions
  for all using (
    plan_id in (select id from public.treatment_plans where therapist_id = auth.uid())
  );

create policy "Clients can read plan versions" on public.treatment_plan_versions
  for select using (
    plan_id in (select id from public.treatment_plans where client_id in (
      select id from public.client_profiles where user_id = auth.uid()
    ))
  );

-- Safety flags: therapist only
create policy "Therapists can manage safety flags" on public.safety_flags
  for all using (
    session_id in (select id from public.sessions where therapist_id = auth.uid())
  );

-- Session summaries
create policy "Therapists can manage summaries" on public.session_summaries
  for all using (
    session_id in (select id from public.sessions where therapist_id = auth.uid())
  );

create policy "Clients can read their summaries" on public.session_summaries
  for select using (
    session_id in (
      select s.id from public.sessions s
      join public.client_profiles cp on s.client_id = cp.id
      where cp.user_id = auth.uid()
    )
  );

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );

  -- Create role-specific profile
  if coalesce(new.raw_user_meta_data->>'role', 'client') = 'therapist' then
    insert into public.therapist_profiles (user_id) values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
