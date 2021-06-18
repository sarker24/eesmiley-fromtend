#!/bin/bash
# Simple script to drop and re-initialize the database
set -e

dropdb -h localhost -p 8001 -U postgres ${DBNAME:-foodwaste} || true >/dev/null
psql -h localhost -p 8001 -U postgres -c "CREATE DATABASE ${DBNAME:-foodwaste}" >/dev/null
psql -h localhost -p 8001 -U postgres --set=dbname=${DBNAME:-foodwaste} --set=user_migration=foodwaste_migration -f ../sql/create-migration-user.sql >/dev/null
psql -h localhost -p 8001 -U postgres --set=dbname=${DBNAME:-foodwaste} --set=user_app=foodwaste_app --set=user_read=foodwaste_read -f ../sql/create-app-user.sql >/dev/null
psql -h localhost -p 8001 -U postgres <<EOF > /dev/null
ALTER USER foodwaste_migration PASSWORD 'asdf1234';
ALTER USER foodwaste_app PASSWORD 'asdf1234';
ALTER USER foodwaste_read PASSWORD 'asdf1234';
EOF

psql -h localhost -p 8001 -U postgres -c "CREATE EXTENSION ltree" ${DBNAME:-foodwaste} >/dev/null
psql -h localhost -p 8001 -U foodwaste_migration --set=user_app=foodwaste_app --set=user_read=foodwaste_read -f ../sql/grant-app-user-permissions.sql ${DBNAME:-foodwaste} >/dev/null
psql -h localhost -p 8001 -U foodwaste_migration --set=user_app=foodwaste_app -f ../sql/create-tables.sql ${DBNAME:-foodwaste} >/dev/null
psql -h localhost -p 8001 -U foodwaste_migration --set=user_app=foodwaste_app -f ../sql/populate-db.sql ${DBNAME:-foodwaste} >/dev/null
#pg_restore -h localhost -p 8001 -U "foodwaste_migration" -n public -d foodwaste -1 ../sql/2019-01-16_foodwaste_data_only.dump

echo "DB re-initialized!"
