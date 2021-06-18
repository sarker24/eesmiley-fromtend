'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('grant select, update on sequence ingredient_id_seq to foodwaste_app')
      .then(queryInterface.sequelize.query('grant select, update on sequence product_id_seq to foodwaste_app'));
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('revoke all on sequence ingredient_id_seq from foodwaste_app')
      .then(queryInterface.sequelize.query('revoke all on sequence product_id_seq from foodwaste_app'));
  }
};
