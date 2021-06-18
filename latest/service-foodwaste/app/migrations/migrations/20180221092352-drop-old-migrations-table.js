'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('_migrations_service_foodwaste');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.createTable('_migrations_service_foodwaste',
      {
        name: Sequelize.STRING
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE ONLY _migrations_service_foodwaste ADD CONSTRAINT _migrations_service_foodwaste_pkey PRIMARY KEY (name)');
      })
      .then(() => {
        return queryInterface.sequelize.query('INSERT INTO _migrations_service_foodwaste(name) SELECT name FROM _migrations')
      })
      .then(() => {
        return queryInterface.sequelize.query('GRANT SELECT ON TABLE _migrations_service_foodwaste TO foodwaste_app, foodwaste_read');
      });
  }
};
