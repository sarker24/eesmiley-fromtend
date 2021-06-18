'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO foodwaste_app')
      .then(() => {
        return queryInterface.sequelize.query('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO foodwaste_app');
      });
  },

  down: function (queryInterface, Sequelize) {
    // no need of rollback logic here
  }
};
