'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('GRANT SELECT ON TABLE ingredient TO foodwaste_read')
      .then(queryInterface.sequelize.query('GRANT SELECT ON TABLE product TO foodwaste_read'))
      .then(queryInterface.sequelize.query('GRANT SELECT ON TABLE product_ingredient TO foodwaste_read'));
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
