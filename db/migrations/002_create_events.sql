CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  host_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(120) NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  price_per_spot NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_per_spot >= 0),
  status VARCHAR(60) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_events_host_user_id ON events(host_user_id);
CREATE INDEX IF NOT EXISTS idx_events_space_id ON events(space_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
