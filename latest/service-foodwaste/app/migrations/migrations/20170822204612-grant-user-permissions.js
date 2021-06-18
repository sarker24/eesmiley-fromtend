'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO foodwaste_app')
      .then(() => queryInterface.sequelize.query('GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO foodwaste_app'))
      .then(() => queryInterface.sequelize.query('GRANT SELECT ON ALL TABLES IN SCHEMA public TO foodwaste_read'))
      .then(() => queryInterface.sequelize.query('GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO foodwaste_read'))
  },

  down: function (queryInterface, Sequelize) {
    // no need of rollback logic here
  }
};
