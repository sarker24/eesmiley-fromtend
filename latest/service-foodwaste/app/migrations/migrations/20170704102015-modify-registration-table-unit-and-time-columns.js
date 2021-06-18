'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('registration', 'update_time', 'updated_at')
      .then(() => {
        return queryInterface.renameColumn('registration', 'create_time', 'created_at');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration ALTER COLUMN unit SET DEFAULT \'kg\'');
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('registration', 'updated_at', 'update_time')
      .then(() => {
        return queryInterface.renameColumn('registration', 'created_at', 'create_time');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration ALTER COLUMN unit DROP DEFAULT');
      });
  }
};
