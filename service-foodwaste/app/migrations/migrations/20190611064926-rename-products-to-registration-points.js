'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER TABLE product RENAME TO registration_point')

  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER TABLE registration_point RENAME TO product')
  }
};
