'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('DROP VIEW area_temp_view, product_temp_view');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(
      'CREATE VIEW area_temp_view AS SELECT DISTINCT customer_id, area AS name FROM registration'
    ).then(() => {
      return queryInterface.sequelize.query(
        'CREATE VIEW product_temp_view AS SELECT DISTINCT customer_id, product AS name, cost, product_category FROM registration'
      );
    });
  }
};
