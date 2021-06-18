'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX mc_ingredient_customer_id_name_idx ON ingredient(customer_id int8_ops,name text_ops,unit text_ops)'
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP INDEX mc_ingredient_customer_id_name_idx');
  }
};
