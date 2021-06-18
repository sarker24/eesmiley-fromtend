'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration_point_ingredient DROP CONSTRAINT product_ingredient_product_id_fkey')
      .then(() => sequelize.query('ALTER TABLE registration_point_ingredient DROP CONSTRAINT product_ingredient_ingredient_id_fkey'));
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration_point_ingredient ADD CONSTRAINT product_ingredient_product_id_fkey FOREIGN KEY (registration_point_id) REFERENCES registration_point(id)')
      .then(() => sequelize.query('ALTER TABLE registration_point_ingredient ADD CONSTRAINT product_ingredient_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES ingredient(id)'));
  }
};
