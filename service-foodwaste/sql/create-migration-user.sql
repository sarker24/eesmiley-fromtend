-- Create migrations user
CREATE USER :user_migration WITH PASSWORD 'very-temporary-password';

-- Grant permissions to migrations user
GRANT CONNECT ON DATABASE :dbname TO :user_migration;
GRANT USAGE ON SCHEMA public TO :user_migration;
REVOKE CREATE ON SCHEMA public FROM public;
GRANT CREATE ON SCHEMA public TO :user_migration;
