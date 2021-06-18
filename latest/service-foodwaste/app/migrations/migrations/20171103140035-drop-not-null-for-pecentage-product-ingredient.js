'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('ALTER TABLE product_ingredient ALTER COLUMN percentage DROP NOT NULL')
      .then(() => queryInterface.sequelize.query('UPDATE product_ingredient SET amount = CAST(percentage as REAL) / 100'));
  },

  down: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('ALTER TABLE product_ingredient ALTER COLUMN percentage SET NOT NULL')
      .then(() => queryInterface.sequelize.query('UPDATE product_ingredient SET amount = 1'));
  }
};
