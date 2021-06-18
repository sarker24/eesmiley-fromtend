'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('UPDATE public.registration set amount=amount*1000')
      .then(() =>  queryInterface.sequelize.query('ALTER TABLE public.registration ALTER COLUMN amount TYPE INTEGER;'))
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.registration ALTER COLUMN amount TYPE REAL;')
      .then(() =>  queryInterface.sequelize.query('UPDATE public.registration set amount=amount/1000'))
  }
};
