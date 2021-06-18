'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE registration ADD COLUMN IF NOT EXISTS co2 BIGINT DEFAULT 0");
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE registration DROP COLUMN IF EXISTS co2");
  }
};
