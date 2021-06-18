'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX mc_product_ingredient_product_id_ingredient_id_idx ON product_ingredient(product_id int8_ops,ingredient_id int8_ops)'
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP INDEX mc_product_ingredient_product_id_ingredient_id_idx');
  }
};
