'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query("select id from product where old_model_type='area' order by id asc", {
      type: sequelize.QueryTypes.SELECT
    })
      .then(areas => {
        const promises = [];

        for (const area of areas) {
          promises.push(
            sequelize.query("update product set " +
              "cost=(" +
              "   select avg(cost)::int from product where old_model_type='product' and path <@ :areaIdString" +
              "), " +
              "amount=(" +
              "   select avg(amount)::int from product where old_model_type='product' and path <@ :areaIdString" +
              "), " +
              "cost_per_kg=(" +
              "   select avg(cost_per_kg)::int from product where old_model_type='product' and path <@ :areaIdString" +
              ") " +
              "where id=:areaIdInt and old_model_type='area'", {
              replacements: { areaIdString: area.id, areaIdInt: +area.id },
              type: sequelize.QueryTypes.UPDATE
            })
          );
        }

        return Promise.all(promises);
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
