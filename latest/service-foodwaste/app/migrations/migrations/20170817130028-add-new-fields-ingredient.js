'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.sequelize.query("ALTER TABLE public.ingredient ADD COLUMN IF NOT EXISTS unit VARCHAR(15) NOT NULL DEFAULT 'kg'")
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.ingredient ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'DKK'"));
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.sequelize.query("ALTER TABLE public.ingredient DROP COLUMN IF  EXISTS unit")
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.ingredient DROP COLUMN IF  EXISTS currency"));
  }
};
