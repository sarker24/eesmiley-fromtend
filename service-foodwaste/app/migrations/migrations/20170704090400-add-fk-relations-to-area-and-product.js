'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(
      'ALTER TABLE registration ADD CONSTRAINT fk_registration_product_product_id FOREIGN KEY (product_id) REFERENCES product(id) ' +
      'ON DELETE CASCADE ON UPDATE CASCADE')
      .then(() => {
        return queryInterface.sequelize.query(
          'ALTER TABLE registration ADD CONSTRAINT fk_registration_area_area_id FOREIGN KEY (area_id) REFERENCES area(id) ' +
          'ON DELETE CASCADE ON UPDATE CASCADE');
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE registration DROP CONSTRAINT fk_registration_product_product_id')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration DROP CONSTRAINT fk_registration_area_area_id');
      });
  }
};
