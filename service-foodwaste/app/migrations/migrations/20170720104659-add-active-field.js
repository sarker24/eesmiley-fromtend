'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.sequelize.query('ALTER TABLE public.product ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL')
      .then(() => {
        queryInterface.sequelize.query('ALTER TABLE public.product_category ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL')
      })
      .then(() => {
        queryInterface.sequelize.query('ALTER TABLE public.area ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL')
      })
      .then(() => {
        queryInterface.sequelize.query('ALTER TABLE public.project ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL')
      })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'product',
      'active'
    ).then(() => {
      return queryInterface.removeColumn(
        'product_category',
        'active');
    }).then(() => {
      return queryInterface.removeColumn(
        'area',
        'active'
      );
    }).then(() => {
      return queryInterface.removeColumn(
        'project',
        'active'
      );
    });
  }
};
