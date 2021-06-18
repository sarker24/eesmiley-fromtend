'use strict';
/*
 * Re-written from:
 module.exports = {
   up: function (queryInterface, Sequelize) {
     return queryInterface.sequelize.query('SELECT * FROM area_temp_view')
       .then((result) => {
         const rows = result[0];
         rows.forEach((row) => {
           return queryInterface.sequelize.query(
             `INSERT INTO area(customer_id, name) VALUES(${row.customer_id}, '${row.name}')`);
         });
       });
   },

   down: function (queryInterface, Sequelize) {
     return queryInterface.sequelize.query('DELETE FROM area WHERE id IS NOT NULL');
   }
 };

 * INSERT is now done without code-iteration, rather let DB do it itself
 * UPDATE now added, since we do want a pointer to who added (used) the area the first time
 * "down" is re-written to simply TRUNCATE
 *
 */
module.exports = {
  up: function (queryInterface, Sequelize) {
    return      queryInterface.sequelize.query('INSERT INTO area(customer_id, name) SELECT * FROM area_temp_view')
    .then(() => queryInterface.sequelize.query('UPDATE area a SET user_id = (SELECT user_id FROM registration r WHERE a.customer_id=r.customer_id AND a.name=r.area LIMIT 1)'))
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('TRUNCATE area');
  }
};
