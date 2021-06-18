'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      "ALTER INDEX product_pkey RENAME TO product_old_pkey"
    )
      .then(queryInterface.sequelize.query(
        "ALTER INDEX ix_mc_product_name_customer_id RENAME TO ix_mc_product_old_name_customer_id"
      ))
      .then(queryInterface.sequelize.query(
        "ALTER INDEX ingredient_pkey RENAME TO ingredient_old_pkey"
      ))
      .then(queryInterface.sequelize.query(
        "ALTER INDEX uix_mc_ingredient_customer_id_name RENAME TO uix_mc_ingredient_old_customer_id_name"
      ))
      .then(queryInterface.sequelize.query(
        "ALTER INDEX uix_mc_product_ingredient_product_id_ingredient_id RENAME TO uix_mc_product_ingredient_old_product_old_id_ingredient_old_id"
      ));
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      "ALTER INDEX product_old_pkey RENAME TO product_pkey"
    )
      .then(queryInterface.sequelize.query(
        "ALTER INDEX ix_mc_product_old_name_customer_id RENAME TO ix_mc_product_name_customer_id"
      ))
      .then(queryInterface.sequelize.query(
        "ALTER INDEX ingredient_old_pkey RENAME TO ingredient_pkey"
      ))
      .then(queryInterface.sequelize.query(
        "ALTER INDEX uix_mc_ingredient_old_customer_id_name RENAME TO uix_mc_ingredient_customer_id_name"
      ))
      .then(queryInterface.sequelize.query(
        "ALTER INDEX uix_mc_product_ingredient_old_product_old_id_ingredient_old_id RENAME TO uix_mc_product_ingredient_product_id_ingredient_id"
      ));
  }
};
