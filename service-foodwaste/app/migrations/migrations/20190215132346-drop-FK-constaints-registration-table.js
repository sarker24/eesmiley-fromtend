'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER TABLE registration DROP CONSTRAINT fk_registration_area_area_id')
      .then(sequelize.query('ALTER TABLE registration DROP CONSTRAINT fk_registration_product_product_id'));

  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER TABLE registration ADD CONSTRAINT fk_registration_product_product_id ' +
      'FOREIGN KEY (product_id) REFERENCES product_old(id) ON UPDATE CASCADE')
      .then(sequelize.query('ALTER TABLE registration ADD CONSTRAINT fk_registration_product_area_id ' +
        'FOREIGN KEY (area_id) REFERENCES area(id) ON UPDATE CASCADE'))
  }
};
