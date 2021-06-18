'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.product ADD COLUMN IF NOT EXISTS bootstrap_key VARCHAR(255)')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE public.product_category ADD COLUMN IF NOT EXISTS bootstrap_key VARCHAR(255)')
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE public.area ADD COLUMN IF NOT EXISTS bootstrap_key VARCHAR(255)')
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE public.ingredient ADD COLUMN IF NOT EXISTS bootstrap_key VARCHAR(255)')
      })
  },

  down: function (queryInterface, Sequelize) {
    /*
     Add reverting commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn(
      'product',
      'bootstrap_key'
    ).then(() => {
      return queryInterface.removeColumn(
        'product_category',
        'bootstrap_key');
    }).then(() => {
      return queryInterface.removeColumn(
        'area',
        'bootstrap_key');
    }).then(() => {
      return queryInterface.removeColumn(
        'ingredient',
        'bootstrap_key');
    });
  }
};
