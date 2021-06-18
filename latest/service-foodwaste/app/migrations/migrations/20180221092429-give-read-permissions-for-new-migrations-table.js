'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('GRANT SELECT ON TABLE _migrations TO foodwaste_app, foodwaste_read');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('REVOKE SELECT ON TABLE _migrations FROM foodwaste_app, foodwaste_read');
  }
};
