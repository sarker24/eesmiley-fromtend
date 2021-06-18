"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    return sequelize.query("CREATE INDEX IF NOT EXISTS index_date_on_registration ON registration USING BTREE (date)")
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    return sequelize.query("DROP INDEX IF EXISTS index_date_on_registration");
  }
};
