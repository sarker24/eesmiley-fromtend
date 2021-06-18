REASSIGN OWNED BY foodwaste_register_app TO foodwaste_app;
REVOKE ALL ON DATABASE foodwaste FROM foodwaste_register_app;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM foodwaste_register_app;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM foodwaste_register_app;
REVOKE ALL ON SCHEMA public FROM foodwaste_register_app;

REASSIGN OWNED BY foodwaste_settings_app TO foodwaste_app;
REVOKE ALL ON DATABASE foodwaste FROM foodwaste_settings_app;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM foodwaste_settings_app;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM foodwaste_settings_app;
REVOKE ALL ON SCHEMA public FROM foodwaste_settings_app;
DROP OWNED BY foodwaste_settings_app;
