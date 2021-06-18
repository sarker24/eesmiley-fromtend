'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.ingredient ADD COLUMN IF NOT EXISTS amount REAL NOT NULL DEFAULT 1')
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('ingredient', 'amount');
  }
};
