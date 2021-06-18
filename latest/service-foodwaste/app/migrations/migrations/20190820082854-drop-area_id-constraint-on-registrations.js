'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration DROP CONSTRAINT fk_registration_product_area_id, ALTER COLUMN area_id DROP NOT NULL');
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration ADD CONSTRAINT fk_registration_product_area_id, ALTER COLUMN area_id ADD NOT NULL');
  }
};
