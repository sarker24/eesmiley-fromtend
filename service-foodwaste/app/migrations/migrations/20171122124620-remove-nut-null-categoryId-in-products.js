'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE product ALTER COLUMN category_id DROP NOT NULL');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE product ALTER COLUMN category_id SET NOT NULL');
  }
};
