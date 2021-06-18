'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER TABLE product_ingredient RENAME TO registration_point_ingredient')

  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER TABLE registration_point_ingredient RENAME TO product_ingredient')
  }
};
