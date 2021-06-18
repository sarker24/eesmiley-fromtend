CREATE ROLE root;

-- Create app user
CREATE USER foodwaste_register_app WITH PASSWORD 'very-temporary-password';

-- Grant permissions to app user
GRANT CONNECT ON DATABASE foodwaste TO foodwaste_register_app;
GRANT USAGE ON SCHEMA "public" TO foodwaste_register_app;

-- Create read-only user
CREATE USER foodwaste_settings_app WITH PASSWORD 'very-temporary-password';

-- Grant permissions to read-only user
GRANT CONNECT ON DATABASE foodwaste TO foodwaste_settings_app;
GRANT USAGE ON SCHEMA "public" TO foodwaste_settings_app;
