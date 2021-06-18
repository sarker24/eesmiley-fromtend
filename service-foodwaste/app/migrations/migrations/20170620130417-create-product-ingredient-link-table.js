'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('product_ingredient', {
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      ingredient_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      percentage: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    })
      .then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX uix_mc_product_ingredient_product_id_ingredient_id ON product_ingredient(product_id, ingredient_id)');
      })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('product_ingredient');
  }
};
