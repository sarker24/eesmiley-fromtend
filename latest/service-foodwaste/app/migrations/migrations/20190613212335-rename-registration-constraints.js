'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration RENAME COLUMN product_id TO registration_point_id')
      .then(sequelize.query(
        'ALTER TABLE registration RENAME CONSTRAINT fk_registration_product_product_id TO fk_registration_registration_point_fk'
      ));
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration RENAME COLUMN registration_point_id TO product_id')
      .then(sequelize.query(
        'ALTER TABLE registration RENAME CONSTRAINT fk_registration_registration_point_fk TO fk_registration_product_product_id'
      ));
  }
};

// fk_registration_product_product_id
