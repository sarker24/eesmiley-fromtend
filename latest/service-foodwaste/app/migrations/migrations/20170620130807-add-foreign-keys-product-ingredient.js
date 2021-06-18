'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE product_ingredient ADD CONSTRAINT ' +
      'fk_product_ingredient_product_id FOREIGN KEY (product_id) REFERENCES product(id) ' +
      'ON DELETE CASCADE ON UPDATE CASCADE')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE product_ingredient ADD CONSTRAINT ' +
          'fk_product_ingredient_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES ingredient(id) ' +
          'ON DELETE CASCADE ON UPDATE CASCADE')
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE product_ingredient DROP CONSTRAINT fk_product_ingredient_product_id')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE product_ingredient DROP CONSTRAINT fk_product_ingredient_ingredient_id');
      });
  }
};
