'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE SEQUENCE ingredient_old_id_seq')
      .then(queryInterface.sequelize.query('CREATE SEQUENCE product_old_id_seq'));
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP SEQUENCE ingredient_old_id_seq')
      .then(queryInterface.sequelize.query('DROP SEQUENCE product_old_id_seq'));
  }
};
