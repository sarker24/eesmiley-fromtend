'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('DROP INDEX IF EXISTS uix_mc_ingredient_customer_id_name')
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX uix_mc_ingredient_customer_id_name ON ingredient(customer_id, name, unit)'))

  },

  down: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('DROP INDEX IF EXISTS uix_mc_ingredient_customer_id_name')
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX uix_mc_ingredient_customer_id_name ON ingredient(customer_id, name)'))
  }
};
