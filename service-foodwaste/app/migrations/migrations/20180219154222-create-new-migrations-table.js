'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE TABLE _migrations AS SELECT * FROM _migrations_service_foodwaste')
      .then(() => {
        /*
         * This is needed because this current migration is finished and is entered as new entry in the current migrations
         * table only after the new "_migrations" table is created, thus the name of this current migration is not copied
         * over to the new "_migrations" table.
         */
        return queryInterface.sequelize.query("INSERT INTO _migrations(name) VALUES('20180219154222-create-new-migrations-table.js')");
      }).then(() => {
        return queryInterface.addColumn(
          '_migrations',
          'id',
          {
            type: Sequelize.BIGINT,
            allowNull: false,
            autoIncrement: true
          }
        )
      }).then(() => {
        return queryInterface.addColumn(
          '_migrations',
          'service_version',
          {
            type: Sequelize.STRING,
            allowNull: true
          }
        );
      }).then(() => {
        return queryInterface.addColumn(
          '_migrations',
          'file',
          {
            type: Sequelize.BLOB('tiny'),
            allowNull: true
          }
        );
      }).then(() => {
        return queryInterface.addColumn(
          '_migrations',
          'raw_sql',
          {
            type: Sequelize.STRING,
            allowNull: true
          }
        );
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP TABLE IF EXISTS _migrations');
  }
};
