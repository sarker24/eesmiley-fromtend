'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("UPDATE bootstrap SET translation_key='_foodwaste.category.dairy' WHERE " +
      "id=1");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("UPDATE bootstrap SET translation_key='foodwaste.category.dairy' WHERE " +
      "id=1");
  }
};
