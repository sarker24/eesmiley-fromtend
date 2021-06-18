'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query("SELECT " +
      " reg.id AS reg_id, " +
      " prod.old_model_id AS old_fk_id, " +
      " prod.id AS new_fk_id " +
      "FROM registration AS reg " +
      "JOIN product AS prod " +
      " ON reg.product_id=prod.old_model_id " +
      " AND prod.old_model_type='product' " +
      " AND prod.path <@ text2ltree(reg.area_id::text) " +
      "WHERE reg.id > 36000 " +
      "GROUP BY reg_id, new_fk_id", {
      type: Sequelize.QueryTypes.SELECT
    })
      .then(result => {
        if (result.length <= 0) {
          return;
        }

        let SQL = 'UPDATE registration AS reg SET ' +
          'product_id = r1.product_id ' +
          'FROM (VALUES ';

        for (const reg of result) {
          SQL += `(${reg.new_fk_id}, ${reg.reg_id}), `;
        }

        SQL = SQL.slice(0, -2); // remove the last comma and empty space

        SQL += ') AS r1(product_id, reg_id) ' +
          'WHERE r1.reg_id = reg.id';

        return sequelize.query(SQL);
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
