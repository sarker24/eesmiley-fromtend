'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.product_ingredient ADD COLUMN IF NOT EXISTS amount REAL NOT NULL DEFAULT 1')
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('product_ingredient', 'amount')
  }
};
