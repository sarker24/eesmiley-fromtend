'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("UPDATE bootstrap SET value = jsonb_set(value, '{properties, label}', to_jsonb('area'::text)) WHERE path IS NULL")
      .then(() =>
        sequelize.query("UPDATE bootstrap SET value = jsonb_set(value, '{properties, label}', to_jsonb('category'::text)) WHERE nlevel(path) = 1"))
      .then(() =>
      sequelize.query("UPDATE bootstrap SET value = jsonb_set(value, '{properties, label}', to_jsonb('product'::text)) WHERE nlevel(path) = 2"))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
