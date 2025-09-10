-- 1) Settings (single row)
create table if not exists about_settings (
  id uuid primary key default gen_random_uuid(),
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  updated_at timestamptz default now()
);
insert into about_settings (hero_title, hero_subtitle, hero_image_url)
select 'О компании Sakina', 'Мы создаем мир здорового сна...', null
where not exists (select 1 from about_settings);

-- 2) Stats
create table if not exists about_stats (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  label text not null,
  icon text not null default 'Clock',
  "order" int not null default 10
);

-- 3) Values
create table if not exists about_values (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null default 'Heart',
  "order" int not null default 10
);

-- 4) Timeline
create table if not exists about_timeline (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  description text not null,
  "order" int not null default 10
);

-- 5) Team
create table if not exists about_team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  description text,
  image_url text,
  "order" int not null default 10
);
