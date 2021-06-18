'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration_point RENAME COLUMN old_model_type TO label').then(()=>
      sequelize.query("ALTER TYPE old_model_type RENAME TO registration_point_label"))
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE registration_point RENAME COLUMN label TO old_model_type').then(()=>
      sequelize.query("ALTER TYPE registration_point_label TO old_model_type RENAME"))
  }
};
