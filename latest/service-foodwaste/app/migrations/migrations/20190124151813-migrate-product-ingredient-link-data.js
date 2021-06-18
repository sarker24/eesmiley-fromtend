'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('select pi.product_id, pi.ingredient_id, pi.percentage, pi.amount ' +
      'from product_ingredient_old pi ' +
      'join (' +
      '   select id from product_old ' +
      '   where product_old.deleted_at is null or product_old.id in (select distinct product_id from registration) ' +
      ') as p on pi.product_id=p.id',
      {
        type: sequelize.QueryTypes.SELECT
      })
      .then(result => {
        const promises = [];

        for (const row of result) {
          Promise.all([
            sequelize.query("select id from product where old_model_id=:productId and old_model_type='product'", {
              type: sequelize.QueryTypes.SELECT,
              replacements: { productId: +row.product_id }
            }),
            sequelize.query("select id from ingredient where old_model_id=:ingredientId", {
              type: sequelize.QueryTypes.SELECT,
              replacements: { ingredientId: +row.ingredient_id }
            })
          ])
            .then(result => {
              for (const product of result[0]) {
                promises.push(
                  sequelize.query("INSERT INTO product_ingredient(product_id, ingredient_id, percentage, amount) " +
                    "VALUES (:productId, :ingredientId, :percentage, :amount)", {
                    type: sequelize.QueryTypes.INSERT,
                    replacements: {
                      productId: +product.id,
                      ingredientId: +result[1][0].id,
                      percentage: row.percentage,
                      amount: row.amount
                    }
                  })
                );
              }
            });
        }

        return Promise.all(promises);
      });
  },

  down: (queryInterface, Sequelize) => {
    /*
     * Drop all rows and restart the sequences
     */
    return queryInterface.sequelize.query('truncate table product_ingredient restart identity cascade')
  }
};
