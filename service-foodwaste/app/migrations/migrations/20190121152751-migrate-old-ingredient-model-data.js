'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('SELECT * FROM ingredient_old', {
      type: sequelize.QueryTypes.SELECT
    })
      .then(ingredients => {
        const promises = [];

        for (const ing of ingredients) {
          promises.push(
            sequelize.query("INSERT INTO ingredient(" +
              "customer_id, name, cost, amount, unit, currency, bootstrap_key, deleted_at, updated_at, created_at, old_model_id" +
              ") VALUES (:customerId, :name, :cost, :amount, :unit, :currency, :bootstrapKey, :deletedAt, :updatedAt, :createdAt, :oldModelId)", {
              type: sequelize.QueryTypes.INSERT,
              replacements: {
                customerId: +ing.customer_id,
                name: ing.name,
                cost: +ing.cost,
                amount: +ing.amount,
                unit: ing.unit,
                currency: ing.currency,
                bootstrapKey: ing.bootstrap_key,
                deletedAt: null,
                updatedAt: ing.updated_at,
                createdAt: ing.created_at,
                oldModelId: +ing.id
              }
            })
          );
        }

        return Promise.all(promises);
      });
  },

  down: (queryInterface, Sequelize) => {
    /*
     * Drop all rows and restart the sequences
     */
    return queryInterface.sequelize.query('truncate table ingredient restart identity cascade')
  }
};
