-- Migrations: Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
    payment_status VARCHAR(50) NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

-- Constraint: Must have either event_id OR space_id, cannot be both
    CHECK (
        (event_id IS NOT NULL AND space_id IS NULL) OR
        (event_id IS NULL AND space_id IS NOT NULL)
    )           
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_space_id ON bookings(space_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
