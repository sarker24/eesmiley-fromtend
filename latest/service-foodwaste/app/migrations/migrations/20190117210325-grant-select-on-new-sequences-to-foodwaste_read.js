'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('grant select on sequence ingredient_old_id_seq to foodwaste_read')
      .then(queryInterface.sequelize.query('grant select on sequence product_old_id_seq to foodwaste_read'));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('revoke all on sequence ingredient_old_id_seq from foodwaste_read')
      .then(queryInterface.sequelize.query('revoke all on sequence product_old_id_seq from foodwaste_read'));
  }
};
