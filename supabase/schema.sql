create table if not exists doctors (
  id text primary key,
  name text not null,
  specialty text not null,
  department text not null,
  photo_url text not null,
  rating numeric not null default 5,
  schedule text not null
);

create table if not exists reviews (
  id text primary key,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  date date not null,
  source text not null,
  doctor_id text references doctors(id) on delete set null
);

create table if not exists patients (
  id text primary key,
  first_name text not null,
  last_name text not null,
  phone text not null unique,
  total_visits integer not null default 0,
  last_visit_date date,
  total_paid integer not null default 0,
  created_at timestamptz not null
);

create table if not exists bookings (
  id text primary key,
  doctor_id text not null references doctors(id) on delete restrict,
  patient_first_name text not null,
  patient_last_name text not null,
  patient_phone text not null,
  appointment_date date not null,
  appointment_time time not null,
  service text not null,
  price integer not null default 0,
  notes text not null default '',
  status text not null,
  created_at timestamptz not null
);

create index if not exists bookings_date_idx on bookings (appointment_date);
create index if not exists bookings_doctor_date_time_idx on bookings (doctor_id, appointment_date, appointment_time);
create index if not exists patients_phone_idx on patients (phone);

create table if not exists notifications (
  id text primary key,
  booking_id text not null references bookings(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null
);

create table if not exists admin_users (
  id text primary key,
  username text not null unique,
  password_hash text not null,
  last_login timestamptz
);

create table if not exists settings (
  key text primary key,
  value text not null
);

alter table doctors enable row level security;
alter table reviews enable row level security;
alter table patients enable row level security;
alter table bookings enable row level security;
alter table notifications enable row level security;
alter table admin_users enable row level security;
alter table settings enable row level security;
