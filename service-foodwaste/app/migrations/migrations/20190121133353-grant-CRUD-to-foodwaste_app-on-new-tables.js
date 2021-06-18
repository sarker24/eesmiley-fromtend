'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE ingredient TO foodwaste_app')
      .then(queryInterface.sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE product TO foodwaste_app'))
      .then(queryInterface.sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE product_ingredient TO foodwaste_app'));
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
