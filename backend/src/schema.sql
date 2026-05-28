CREATE TABLE IF NOT EXISTS people (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL CHECK (char_length(trim(first_name)) BETWEEN 1 AND 80),
  last_name TEXT NOT NULL CHECK (char_length(trim(last_name)) BETWEEN 1 AND 80),
  date_of_birth DATE NOT NULL,
  anniversary_date DATE NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE people ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS people_birth_month_day_idx
  ON people ((EXTRACT(MONTH FROM date_of_birth)), (EXTRACT(DAY FROM date_of_birth)));

CREATE INDEX IF NOT EXISTS people_anniversary_month_day_idx
  ON people ((EXTRACT(MONTH FROM anniversary_date)), (EXTRACT(DAY FROM anniversary_date)));

CREATE INDEX IF NOT EXISTS people_created_at_idx ON people (created_at DESC);
