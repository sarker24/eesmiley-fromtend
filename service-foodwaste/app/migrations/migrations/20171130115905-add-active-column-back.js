'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.category ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL')
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'category',
      'active'
    );
  }
};
