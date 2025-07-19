// scripts/init_schema.ts
// Usage:
// SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/init_schema.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const TABLE_SQL = `
-- USERS / PROFILES
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  password text not null,
  role text, -- 'buyer', 'provider', 'admin', etc.
  company_name text,
  company_description text,
  company_phone text,
  company_address text,
  company_website text,
  banner_url text,
  profile_url text,
  is_super_admin boolean default false,
  is_active boolean default true,
  is_verified boolean default false,
  metadata jsonb, -- for future extensibility (e.g., social links, preferences)
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

-- SETTINGS
create table if not exists settings (
  id serial primary key,
  site_name text not null,
  site_description text,
  contact_email text not null,
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_pass text,
  from_email text,
  favicon_url text,
  extra jsonb, -- for future settings
  created_at timestamp default now(),
  updated_at timestamp default now(),
  x_secret text,
  setup_complete boolean default false
);

-- CITIES
create table if not exists cities (
  id serial primary key,
  name text not null,
  name_en text,
  region text,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- CATEGORIES
create table if not exists categories (
  id serial primary key,
  name text not null,
  name_en text,
  parent_id integer references categories(id),
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- JOBS
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category_id integer references categories(id),
  city_id integer references cities(id),
  budget text,
  contact_name text,
  contact_phone text,
  contact_email text,
  status text, -- 'pending', 'approved', 'active', 'completed', 'cancelled'
  scheduled_at timestamp, -- for future job scheduling
  assigned_to uuid references profiles(id),
  metadata jsonb, -- for extra fields (e.g., attachments, tags)
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

-- DOCUMENTS
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text,
  file_name text,
  file_url text,
  status text, -- 'pending', 'approved', 'rejected'
  uploaded_at timestamp default now(),
  reviewed_at timestamp,
  reviewed_by uuid references profiles(id),
  expires_at timestamp,
  rejection_reason text,
  metadata jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

-- MESSAGES (for in-site messaging)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  job_id uuid references jobs(id),
  content text,
  is_read boolean default false,
  sent_at timestamp default now(),
  metadata jsonb
);

-- NOTIFICATIONS (for alerts, price drops, etc.)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text, -- 'price_drop', 'job_update', etc.
  content text,
  is_read boolean default false,
  created_at timestamp default now(),
  metadata jsonb
);

-- SCHEDULER (for job time, reminders, etc.)
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id),
  user_id uuid references profiles(id),
  scheduled_for timestamp,
  status text, -- 'pending', 'confirmed', 'cancelled'
  created_at timestamp default now(),
  updated_at timestamp default now(),
  metadata jsonb
);

-- ACTIVITY LOG (for auditing, admin actions, etc.)
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text,
  details text,
  ip_address text,
  created_at timestamp default now(),
  metadata jsonb
);
`;

async function main() {
  console.log('Connecting to Supabase...');
  // Use the SQL API (Postgres meta endpoint)
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: TABLE_SQL }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to run schema SQL:', text);
    process.exit(1);
  }
  console.log('Database schema created/updated successfully!');
}

main().catch(e => { console.error(e); process.exit(1); }); 