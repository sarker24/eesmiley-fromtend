'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.sale ALTER COLUMN date TYPE date;');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.sale ALTER COLUMN date TYPE timestamp with time zone;');  }
};
