#!/bin/bash

set -e

FROM_DATE="2018-01-01"
TO_DATE=$(date '+%Y-%m-%d')
DEMO_ACCOUNT_IDS="37313,37312,37286" 
DATABASE_NAME="foodwaste"

database_user=""
database_host=""
database_port=""
database_env="local"

print_usage() {
  printf "Generates guest and registration point registrations for foodwaste demo accounts 37313,37312,37286 \n"
  printf "Usage: -u username -e local|dev|stag|prod\nOr with pg password: PGPASSWORD=password ./generate-demo-registrations.sh -u ...\n"
  exit 2
}

get_database_host() {
 case $1 in
	"local") echo "localhost";;
	"dev") echo "10.50.1.49";;
	"stag") echo "10.50.1.16";;
	"prod") echo "microservice.czychqgqsybc.eu-central-1.rds.amazonaws.com";;
	*) echo "";;
 esac 
}

get_database_port() {
 case $1 in
	"local") echo "8001";;
	*) echo ""
 esac
}


while getopts 'u:e:' arg; do
  case "${arg}" in
    u) database_user="${OPTARG}" ;;
    e) database_env="${OPTARG}" ;;
    *) print_usage
       exit 1 ;;
  esac
done

database_host="$(get_database_host $database_env)"
database_port="$(get_database_port $database_env)"

([[ -z $database_env ]] || [[ -z $database_user ]] || [[ -z $database_host ]]) && print_usage

db_connection_string="psql -h $database_host ${database_port:+ -p $database_port} -U $database_user -v ON_ERROR_STOP=true -Aq"

echo "Pushing generate registration data function to $database_env..."
$db_connection_string -d $DATABASE_NAME -f ../sql/create-random-registration-data.sql
echo "Calling generate registration data function on demo accounts $DEMO_ACCOUNT_IDS in range ($FROM_DATE - $TO_DATE)..."
$db_connection_string -d $DATABASE_NAME -c "DO \$\$ BEGIN PERFORM create_random_registration_data('{$DEMO_ACCOUNT_IDS}', date '$FROM_DATE', date '$TO_DATE'); END \$\$;"

