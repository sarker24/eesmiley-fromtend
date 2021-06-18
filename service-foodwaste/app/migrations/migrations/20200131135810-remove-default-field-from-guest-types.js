'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE guest_type DROP COLUMN is_default');
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query(
      'ALTER TABLE guest_type ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false'
    );
  }
};
