'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    const areas = queryInterface.sequelize.query('SELECT id, customer_id, name FROM area', {type: 'SELECT'});
    const products = queryInterface.sequelize.query('SELECT id, customer_id, name FROM product', {type: 'SELECT'});
    const registrations = queryInterface.sequelize.query('SELECT id, customer_id, area, product FROM registration', {type: 'SELECT'});

    const updateRegsPromises = [];

    return Promise.all([areas, products, registrations]).then(results => {
      const resAreas = results[0];
      const resProducts = results[1];
      const resRegs = results[2];

      resRegs.forEach((reg) => {
        resAreas.forEach((area) => {
          if (reg.customer_id == area.customer_id && reg.area == area.name) {
            updateRegsPromises.push(queryInterface.sequelize.query(`UPDATE registration SET area_id=${area.id} WHERE id=${reg.id}`));
          }
        });

        resProducts.forEach((product) => {
          if (reg.customer_id == product.customer_id && reg.product == product.name) {
            updateRegsPromises.push(queryInterface.sequelize.query(`UPDATE registration SET product_id=${product.id} WHERE id=${reg.id}`));
          }
        });
      });

      return Promise.all(updateRegsPromises);
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('UPDATE registration SET area_id=NULL WHERE area_id IS NOT NULL')
      .then(() => {
        queryInterface.sequelize.query('UPDATE registration SET product_id=NULL WHERE product_id IS NOT NULL');
      })
  }
};
