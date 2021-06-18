'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.registration ALTER COLUMN cost TYPE BIGINT;');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.registration ALTER COLUMN cost TYPE INTEGER;');
  }
};
