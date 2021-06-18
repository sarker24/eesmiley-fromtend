'use strict';
/*
 * Re-written from:
 module.exports = {
   up: function (queryInterface, Sequelize) {
     return queryInterface.sequelize.query('SELECT * FROM product_temp_view')
       .then((result) => {
         const rows = result[0];
         rows.forEach((row) => {
           const query_category = `INSERT INTO product_category(customer_id, name) VALUES(${row.customer_id}, $$${row.product_category}$$) RETURNING id`;
           return queryInterface.sequelize.query(query_category)
             .then((result_category) => {
               const query_product = `INSERT INTO product(customer_id, category_id, name, cost) VALUES(${row.customer_id}, ${result_category[0].id}, $$${row.name}$$, ${row.cost})`;
               return queryInterface.sequelize.query(query_product);
             });
         });
       });
   },

   down: function (queryInterface, Sequelize) {
     return queryInterface.sequelize.query('DELETE FROM product WHERE id IS NOT NULL')
       .then(() => {
         return queryInterface.sequelize.query('DELETE FROM product_category WHERE id IS NOT NULL');
       });
   }
 };


 * INSERT is now done without code-iteration, rather let DB do it itself
 * UPDATE now added, since we do want a pointer to who added (used) the area the first time
 * "down" is re-written to simply TRUNCATE
 *
 */
module.exports = {
  up: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('INSERT INTO product_category(customer_id, name) SELECT DISTINCT customer_id,product_category FROM product_temp_view')
      .then(() => queryInterface.sequelize.query('UPDATE product_category pc SET user_id = (SELECT user_id FROM registration r WHERE pc.customer_id=r.customer_id AND pc.name=r.product_category LIMIT 1)'))
      .then(() => queryInterface.sequelize.query('INSERT INTO product(customer_id, user_id, category_id, name, cost)\
                                                    SELECT pc.customer_id, pc.user_id, id, ptv.name, ptv.cost FROM product_category pc LEFT JOIN product_temp_view ptv ON\
                                                    pc.customer_id=ptv.customer_id AND pc.name=ptv.product_category'))
  },

  down: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('TRUNCATE product CASCADE')
      .then(() => queryInterface.sequelize.query('TRUNCATE product_category CASCADE'));
  }
};
