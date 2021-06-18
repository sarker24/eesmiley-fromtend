'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query("UPDATE product AS category SET amount=products.avg_amount FROM " +
      "(SELECT parent_product_id, avg(amount)::int AS avg_amount FROM product GROUP BY parent_product_id) AS products " +
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
