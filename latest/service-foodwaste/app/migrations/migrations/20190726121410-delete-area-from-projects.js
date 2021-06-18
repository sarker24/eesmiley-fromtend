'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE project DROP COLUMN area')
  },

  down: (queryInterface, Sequelize) => {
  }
};
