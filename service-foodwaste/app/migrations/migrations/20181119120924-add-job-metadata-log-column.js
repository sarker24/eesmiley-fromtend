'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query("ALTER TABLE settings ADD COLUMN job_log JSONB DEFAULT '{}'");
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query('ALTER TABLE settings DROP COLUMN job_log');
  }
};
