'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.product ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL DEFAULT 1000')
      .then(() => queryInterface.sequelize.query('ALTER TABLE public.product ADD COLUMN IF NOT EXISTS cost_per_kg INTEGER'))
      .then(() => queryInterface.sequelize.query('UPDATE public.product SET cost_per_kg = cost WHERE cost_per_kg IS NULL'))
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('product', 'amount')
      .then(() => queryInterface.removeColumn('product', 'cost_per_kg'));
  }
};
