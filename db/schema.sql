-- Natlus Inc. Portfolio — schema
-- A single generic `content` key-value table for singleton content and
-- dedicated tables (JSONB `data` column) for list content, so the admin
-- panel stays flexible and the schema stays small.
--
-- Every list table carries a `seed_key`: a stable identifier for the
-- seeded row, so re-running the seed updates the existing row instead of
-- inserting a duplicate. Admin-created rows have seed_key = NULL and are
-- never touched by the seed.

CREATE TABLE IF NOT EXISTS content (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id        SERIAL PRIMARY KEY,
  seed_key  TEXT,
  data      JSONB NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS services_seed_key ON services (seed_key);

CREATE TABLE IF NOT EXISTS packages (
  id        SERIAL PRIMARY KEY,
  seed_key  TEXT,
  data      JSONB NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS packages_seed_key ON packages (seed_key);

CREATE TABLE IF NOT EXISTS projects (
  id        SERIAL PRIMARY KEY,
  slug      TEXT NOT NULL,
  seed_key  TEXT,
  data      JSONB NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON projects (slug);
CREATE UNIQUE INDEX IF NOT EXISTS projects_seed_key ON projects (seed_key);

CREATE TABLE IF NOT EXISTS process_steps (
  id        SERIAL PRIMARY KEY,
  seed_key  TEXT,
  data      JSONB NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS process_steps_seed_key ON process_steps (seed_key);

CREATE TABLE IF NOT EXISTS benefits (
  id        SERIAL PRIMARY KEY,
  seed_key  TEXT,
  data      JSONB NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS benefits_seed_key ON benefits (seed_key);

CREATE TABLE IF NOT EXISTS testimonials (
  id        SERIAL PRIMARY KEY,
  seed_key  TEXT,
  data      JSONB NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS testimonials_seed_key ON testimonials (seed_key);

CREATE TABLE IF NOT EXISTS faqs (
  id        SERIAL PRIMARY KEY,
  seed_key  TEXT,
  data      JSONB NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS faqs_seed_key ON faqs (seed_key);

CREATE TABLE IF NOT EXISTS socials (
  id        SERIAL PRIMARY KEY,
  seed_key  TEXT,
  data      JSONB NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS socials_seed_key ON socials (seed_key);

CREATE TABLE IF NOT EXISTS contact_messages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  service     TEXT NOT NULL DEFAULT '',
  budget      TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);

CREATE TABLE IF NOT EXISTS image_blobs (
  id           SERIAL PRIMARY KEY,
  data         TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'png',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
