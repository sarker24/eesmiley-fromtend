'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('select * from area ' +
      'where ' +
      '   area.deleted_at is null ' +
      'or ' +
      '   area.id in (select distinct area_id from registration) ' +
      'order by id',
      {
        type: sequelize.QueryTypes.SELECT
      })
      .then(areas => {
        const promises = [];

        for (const area of areas) {
          promises.push(
            sequelize.query("INSERT INTO product(" +
              "user_id, customer_id, name, cost, image, active, amount, cost_per_kg, bootstrap_key, deleted_at, updated_at, created_at, old_model_id, old_model_type" +
              ") VALUES (:userId, :customerId, :name, :cost, :image, :active, :amount, :costPerKg, :bootstrapKey, :deletedAt, :updatedAt, :createdAt, :oldModelId, :oldModelType)", {
              type: sequelize.QueryTypes.INSERT,
              replacements: {
                userId: +area.user_id,
                customerId: +area.customer_id,
                name: area.name,
                cost: null,
                image: area.image === null ? null : JSON.stringify(area.image),
                active: area.active,
                amount: null,
                costPerKg: null,
                bootstrapKey: area.bootstrap_key,
                deletedAt: area.deleted_at,
                updatedAt: area.updated_at,
                createdAt: area.created_at,
                oldModelId: +area.id,
                oldModelType: 'area'
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
    return queryInterface.sequelize.query('truncate table product restart identity cascade')
  }
};
