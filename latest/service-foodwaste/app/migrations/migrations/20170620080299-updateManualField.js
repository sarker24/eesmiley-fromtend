'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('UPDATE public.registration SET manual = true WHERE manual IS NULL');
  },

  down: function (queryInterface, Sequelize) {
  /*
   * NO way back since "manual" column does not accept NULL values
   */
  }
};
