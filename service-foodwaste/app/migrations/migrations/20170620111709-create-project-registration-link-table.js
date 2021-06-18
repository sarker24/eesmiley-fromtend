'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('project_registration', {
      project_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      registration_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      }
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('project_registration');
  }
};
