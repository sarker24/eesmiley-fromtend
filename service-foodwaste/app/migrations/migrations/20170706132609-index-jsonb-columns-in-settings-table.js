'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('CREATE INDEX idx_settings_current ON settings USING gin(current)')
      .then(() => {
        return queryInterface.sequelize.query('CREATE INDEX idx_settings_history ON settings USING gin(history)');
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('DROP INDEX idx_settings_current')
      .then(() => {
        return queryInterface.sequelize.query('DROP INDEX idx_settings_history');
      });
  }
};
