'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'registration',
      'area_id',
      {
        type: Sequelize.BIGINT
      }
    ).then(() => {
      return queryInterface.addColumn(
        'registration',
        'product_id',
        {
          type: Sequelize.BIGINT
        }
      )
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('registration', 'product_id')
      .then(() => {
        return queryInterface.removeColumn('registration', 'area_id');
      });
  }
};
