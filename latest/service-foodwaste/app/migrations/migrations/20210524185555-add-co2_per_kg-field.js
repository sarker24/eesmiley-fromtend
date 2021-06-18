'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE registration_point ADD COLUMN IF NOT EXISTS co2_per_kg INTEGER DEFAULT 0");
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE registration_point DROP COLUMN IF EXISTS co2_per_kg");
  }
};
