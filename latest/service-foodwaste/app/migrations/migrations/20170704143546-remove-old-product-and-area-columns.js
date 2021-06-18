'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('registration', 'product')
      .then(() => {
        return queryInterface.removeColumn('registration', 'area');
      })
      .then(() => {
        return queryInterface.removeColumn('registration', 'product_category');
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'registration',
      'area',
      {
        type: Sequelize.STRING
      }
    ).then(() => {
      return queryInterface.addColumn(
        'registration',
        'product',
        {
          type: Sequelize.STRING
        }
      )
    }).then(() => {
      return queryInterface.addColumn(
        'registration',
        'product_category',
        {
          type: Sequelize.STRING
        }
      )
    });
  }
};
