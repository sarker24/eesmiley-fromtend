'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('grant select, update on sequence ingredient_old_id_seq to postgres')
      .then(queryInterface.sequelize.query('grant select, update on sequence product_old_id_seq to postgres'));
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('revoke all on sequence ingredient_old_id_seq from postgres')
      .then(queryInterface.sequelize.query('revoke all on sequence product_old_id_seq from postgres'));
  }
};
