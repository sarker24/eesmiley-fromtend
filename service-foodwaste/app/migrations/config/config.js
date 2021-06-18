'use strict';

const app = require('../../src/app').default;
const env = app.get('env');

module.exports = {
  [env]: {
    url: app.get('postgres_migration'),
    dialect: 'postgres',
    migrationStorageTableName: app.get('migration_table')
  }
};
