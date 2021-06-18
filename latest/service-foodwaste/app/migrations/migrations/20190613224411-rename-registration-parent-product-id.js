
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration_point RENAME COLUMN parent_product_id TO parent_id')
      .then(sequelize.query(
        'ALTER TABLE registration_point RENAME CONSTRAINT product_parent_product_id_fkey TO registration_point_parent_id_fk'
      ));
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration_point RENAME COLUMN parent_id TO parent_product_id')
      .then(sequelize.query(
        'ALTER TABLE registration_point RENAME CONSTRAINT registration_point_parent_id_fk TO product_parent_product_id_fkey'
      ));
  }
};
