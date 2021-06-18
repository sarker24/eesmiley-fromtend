'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("CREATE TYPE old_model_type AS ENUM ('category', 'area', 'product')");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP TYPE old_model_type');
  }
};
