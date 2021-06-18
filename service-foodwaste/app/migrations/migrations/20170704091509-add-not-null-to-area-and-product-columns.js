'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE registration ALTER COLUMN area_id SET NOT NULL')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration ALTER COLUMN product_id SET NOT NULL');
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE registration ALTER COLUMN product_id DROP NOT NULL')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration ALTER COLUMN area_id DROP NOT NULL');
      });
  }
};
