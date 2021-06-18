'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.registration ALTER COLUMN amount TYPE REAL;');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.registration ALTER COLUMN amount TYPE INTEGER;');
  }
};
