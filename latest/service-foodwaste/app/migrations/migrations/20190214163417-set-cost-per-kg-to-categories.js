'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query("UPDATE product AS category SET cost_per_kg=products.avg_cost_per_kg FROM " +
      "(SELECT parent_product_id, avg(cost_per_kg)::int AS avg_cost_per_kg FROM product GROUP BY parent_product_id) AS products " +
      "WHERE products.parent_product_id = category.id AND category.old_model_type = 'category'", {
      type: sequelize.QueryTypes.UPDATE
    });
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
