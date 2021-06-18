'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      ' CREATE TABLE product_ingredient ( ' +
      '     product_id bigint NOT NULL REFERENCES product(id) ON UPDATE CASCADE, ' +
      '     ingredient_id bigint NOT NULL REFERENCES ingredient(id) ON UPDATE CASCADE, ' +
      '     percentage integer, ' +
      '     amount real NOT NULL DEFAULT 1 ' +
      ' ); ');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('product_ingredient');
  }
};
