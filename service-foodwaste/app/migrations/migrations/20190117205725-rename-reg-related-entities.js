'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE product RENAME TO product_old')
      .then(queryInterface.sequelize.query('ALTER TABLE ingredient RENAME TO ingredient_old'))
      .then(queryInterface.sequelize.query('ALTER TABLE product_ingredient RENAME TO product_ingredient_old'));
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE product_old RENAME TO product')
      .then(queryInterface.sequelize.query('ALTER TABLE ingredient_old RENAME TO ingredient'))
      .then(queryInterface.sequelize.query('ALTER TABLE product_ingredient_old RENAME TO product_ingredient'));
  }
};
