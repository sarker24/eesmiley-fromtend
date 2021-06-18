'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE INDEX product_path_idx ON product USING GIST (path)');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP INDEX product_path_idx');
  }
};
