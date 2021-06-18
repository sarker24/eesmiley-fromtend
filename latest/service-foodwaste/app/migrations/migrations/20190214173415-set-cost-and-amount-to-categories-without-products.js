'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query("update product p set " +
      "  cost = result.cost, " +
      "  amount = result.amount, " +
      "  cost_per_kg = result.cost_per_kg " +
      "from ( " +
      "  select pc.id, pc.parent_product_id, pa.cost, pa.amount, pa.cost_per_kg from product pc " +
      "  join product pa on pc.parent_product_id=pa.id " +
      "  where pc.old_model_type='category' and (pc.cost is null or pc.amount is null or pc.cost_per_kg is null) " +
      ") as result " +
      "where p.id = result.id",
      {
        type: sequelize.QueryTypes.UPDATE
      })
      .then(() => {
        return sequelize.query("update product p set   " +
          "  cost = result.cost, " +
          "  amount = result.amount, " +
          "  cost_per_kg = result.kg " +
          "from (  " +
          "   select avg(cost)::int as cost, avg(amount)::int as amount, avg(cost_per_kg)::int as kg from product " +
          ") as result " +
          "where id in (select id from product where cost is null or amount is null or cost_per_kg is null)",
          {
            type: sequelize.QueryTypes.UPDATE
          });
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
