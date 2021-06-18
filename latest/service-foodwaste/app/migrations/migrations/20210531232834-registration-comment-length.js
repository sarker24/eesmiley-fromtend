'use strict';

// add separate customer_comment field,
// the existing comment field is for internal usage
module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE registration ALTER COLUMN customer_comment TYPE varchar(255)");
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE registration ALTER COLUMN customer_comment TYPE varchar(100)");
  }
};
