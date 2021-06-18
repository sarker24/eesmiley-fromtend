"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    return sequelize.query(
      "INSERT INTO template (" +
      "name," +
      "template_account_id" +
      ") VALUES ('esmiley_moa', 44146)"
    );
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    return sequelize.query("DELETE FROM template");
  }
};
