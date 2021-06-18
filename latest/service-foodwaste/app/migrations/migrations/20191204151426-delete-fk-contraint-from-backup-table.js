'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE backup_registration_point DROP CONSTRAINT backup_registration_point_parent_id_fkey");
  },

  down: (queryInterface, Sequelize) => {

  }
};
