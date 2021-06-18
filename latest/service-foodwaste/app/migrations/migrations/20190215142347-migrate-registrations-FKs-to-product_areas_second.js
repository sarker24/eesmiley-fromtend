'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;
    let registrations;

    return sequelize.query("SELECT " +
      " reg.id AS reg_id, " +
      " reg.area_id, " +
      " prod.old_model_id AS old_fk_id, " +
      " prod.id AS new_fk_id " +
      "FROM registration as reg " +
      "JOIN product AS prod ON reg.area_id=prod.old_model_id AND prod.old_model_type='area' " +
      "WHERE reg.id > 18000 AND reg.id <= 36000 " +
      "GROUP BY reg_id, new_fk_id", {
      type: Sequelize.QueryTypes.SELECT
    })
      .then(result => {
        if (result.length <= 0) {
          return;
        }

        let SQL = 'UPDATE registration AS reg SET ' +
          'area_id = r1.area_id ' +
          'FROM (VALUES ';

        for (const reg of result) {
          SQL += `(${reg.new_fk_id}, ${reg.reg_id}), `;
        }

        SQL = SQL.slice(0, -2); // remove the last comma

        SQL += ') AS r1(area_id, reg_id) ' +
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
