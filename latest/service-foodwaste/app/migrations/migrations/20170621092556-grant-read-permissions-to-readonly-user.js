'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('GRANT SELECT ON ALL TABLES IN SCHEMA public TO foodwaste_read')
      .then(() => {
        return queryInterface.sequelize.query('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO foodwaste_read');
      });
  },

  down: function (queryInterface, Sequelize) {
    // no need of rollback logic here
  }
};
