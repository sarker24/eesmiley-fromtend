-- Grant usage and CRUD permissions to the app user for all tables used by the app
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :user_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :user_app;

-- Grant usage and READ-only permissions to the foodwaste_read user for all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO :user_read;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :user_read;