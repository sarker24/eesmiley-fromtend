'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('grant select, update on sequence ingredient_id_seq to foodwaste_read')
      .then(queryInterface.sequelize.query('grant select, update on sequence product_id_seq to foodwaste_read'));
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('revoke all on sequence ingredient_id_seq from foodwaste_read')
      .then(queryInterface.sequelize.query('revoke all on sequence product_id_seq from foodwaste_read'));
  }
};
