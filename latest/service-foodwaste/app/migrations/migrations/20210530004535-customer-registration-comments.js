'use strict';

// add separate customer_comment field,
// the existing comment field is for internal usage
module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE registration ADD COLUMN IF NOT EXISTS customer_comment varchar(100)");
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE registration DROP COLUMN IF EXISTS customer_comment");
  }
};
