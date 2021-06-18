'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(
      "CREATE TYPE project_status_type AS ENUM ('PENDING_START', 'PENDING_FOLLOWUP', 'RUNNING', 'AWAITING_ACTION', 'FINISHED')");
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('DROP TYPE project_status_type');
  }
};
