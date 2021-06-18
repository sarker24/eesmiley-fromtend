'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("INSERT INTO  backup_registration_point SELECT * from registration_point");
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("DELETE FROM backup_registration_point");
  }
};
