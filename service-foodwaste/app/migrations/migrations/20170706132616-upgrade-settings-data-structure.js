'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SELECT id, current, history FROM settings', { type: 'SELECT' })
      .then((result) => {
        const promises = [];
        let current, history, setting;

        result.forEach((row) => {
          current = JSON.stringify(iterateAndUpdate(row.current));

          Object.keys(row.history).forEach((key, index) => {
            setting = iterateAndUpdate(row.history[key].settings);
            row.history[key].settings = setting;
          });
          history = JSON.stringify(row.history);

          promises.push(queryInterface.sequelize.query(`UPDATE settings SET current=$$${current}$$ WHERE id=${row.id}`));
          promises.push(queryInterface.sequelize.query(`UPDATE settings SET history=$$${history}$$ WHERE id=${row.id}`));
        });

        return Promise.all(promises);
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SELECT id, current, history FROM settings', { type: 'SELECT' })
      .then((result) => {
        const promises = [];
        let current, history, setting;

        result.forEach((row) => {
          current = JSON.stringify(iterateAndDelete(row.current));

          Object.keys(row.history).forEach((key, index) => {
            setting = iterateAndDelete(row.history[key].settings);
            row.history[key].settings = setting;
          });
          history = JSON.stringify(row.history);

          promises.push(queryInterface.sequelize.query(`UPDATE settings SET current=$$${current}$$ WHERE id=${row.id}`));
          promises.push(queryInterface.sequelize.query(`UPDATE settings SET history=$$${history}$$ WHERE id=${row.id}`));
        });

        return Promise.all(promises);
      });
  }
};

function iterateAndUpdate(object) {
  object['mandatory'] = ['area', 'productCategory', 'product'];
  object.productCategories.forEach((category) => {
    category.products.forEach((product) => {
      product['active'] = true;
      product['image'] = null;
    });
  });

  return object;
}

function iterateAndDelete(object) {
  delete object.mandatory;
  object.productCategories.forEach((category) => {
    category.products.forEach((product) => {
      delete product.active;
      delete product.image;
    });
  });

  return object;
}
