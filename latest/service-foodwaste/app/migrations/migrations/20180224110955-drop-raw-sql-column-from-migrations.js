'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('_migrations', 'raw_sql');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      '_migrations',
      'raw_sql',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
  }
};
