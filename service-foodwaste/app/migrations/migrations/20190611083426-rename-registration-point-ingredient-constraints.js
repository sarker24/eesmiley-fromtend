'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration_point_ingredient RENAME COLUMN product_id TO registration_point_id')
      .then(sequelize.query(
        'ALTER INDEX mc_product_ingredient_product_id_ingredient_id_idx RENAME TO mc_registration_point_ingredient_registration_point_id_ingredient_id_idx'
      ));
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration_point_ingredient RENAME COLUMN registration_point_id TO product_id')
      .then(sequelize.query(
        'ALTER INDEX mc_registration_point_ingredient_registration_point_id_ingredient_id_idx RENAME TO mc_product_ingredient_product_id_ingredient_id_idx'
      ));
  }
};
