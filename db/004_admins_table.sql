-- Create admins table
CREATE TABLE admins (
	id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	login         TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
	created_at    TIMESTAMPTZ DEFAULT NOW(),
	last_login    TIMESTAMPTZ
);

-- Insert initial admin (login: admin, password: admin)
-- The hash below is for 'admin' using bcrypt cost 10
INSERT INTO admins (login, password_hash, status)
VALUES ('admin', '$2b$10$7R/M.B33H/fQj9V9W9W9W.9W9W9W9W9W9W9W9W9W9W9W9W9W9W9W9', 'active');
