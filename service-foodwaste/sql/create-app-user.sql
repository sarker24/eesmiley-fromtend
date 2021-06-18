-- Create app user
CREATE USER :user_app WITH PASSWORD 'very-temporary-password';

-- Grant permissions to app user
GRANT CONNECT ON DATABASE :dbname TO :user_app;
GRANT USAGE ON SCHEMA "public" TO :user_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :user_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO :user_app;

-- Create read-only user
CREATE USER :user_read WITH PASSWORD 'very-temporary-password';

-- Grant permissions to read-only user
GRANT CONNECT ON DATABASE :dbname TO :user_read;
GRANT USAGE ON SCHEMA "public" TO :user_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO :user_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO :user_read;
