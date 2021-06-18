'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return      queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_product_category_name_customer_id;')
    .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_category_name_customer_id;'))
    .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS uix_mc_category_name_customer_id ON category(customer_id, name) WHERE deleted_at IS NULL;'))

  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_category_name_customer_id ON category(customer_id, name) WHERE deleted_at IS NULL;')
    .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_category_name_customer_id ON category(customer_id, name)'))
    .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS uix_mc_category_name_customer_id;'))

  }
};
