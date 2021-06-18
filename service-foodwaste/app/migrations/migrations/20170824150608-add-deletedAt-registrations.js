'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.registration ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'registration',
      'deleted_at'
    )  }
};
