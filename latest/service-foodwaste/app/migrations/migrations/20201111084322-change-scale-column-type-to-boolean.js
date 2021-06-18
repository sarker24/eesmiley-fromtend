'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration ALTER COLUMN scale TYPE BOOLEAN USING scale::BOOLEAN');
  },

  down: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration ALTER COLUMN scale TYPE VARCHAR(10)');
  }
};
