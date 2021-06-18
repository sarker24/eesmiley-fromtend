'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_area_name_customer_id;')
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_product_category_name_customer_id;'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_product_name_customer_id;'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_bootstrap_translation_key;'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS uix_mc_sale_customer_id_date;'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_area_name_customer_id ON area(customer_id, name) WHERE deleted_at IS NULL;'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_category_name_customer_id ON product_category(customer_id, name) WHERE deleted_at IS NULL;'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_name_customer_id ON product(customer_id, name) WHERE deleted_at IS NULL;'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_bootstrap_translation_key ON bootstrap(translation_key) WHERE deleted_at IS NULL;'))
      /*
       * Sale data is currently dirty with duplicates, so data is temporarily migrated to a temp table to be cleaned up
       */
      .then(() => queryInterface.sequelize.query('DROP TABLE IF EXISTS tmp_sale;'))
      .then(() => queryInterface.sequelize.query('CREATE TABLE tmp_sale AS SELECT * FROM sale'))
      .then(() => queryInterface.sequelize.query('TRUNCATE TABLE tmp_sale'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS uix_mc_sale_customer_id_date ON tmp_sale(customer_id, date) WHERE deleted_at IS NULL;'))
      .then(() => queryInterface.sequelize.query('INSERT INTO tmp_sale SELECT * from sale ORDER BY date DESC ON CONFLICT DO NOTHING;'))
      .then(() => queryInterface.sequelize.query('DELETE FROM sale WHERE id NOT IN (SELECT id from tmp_sale);'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS uix_mc_sale_customer_id_date ON sale(customer_id, date) WHERE deleted_at IS NULL;'))
      .then(() => queryInterface.sequelize.query('DROP TABLE IF EXISTS tmp_sale;'))


  },

  down: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_area_name_customer_id;')
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_product_category_name_customer_id;'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_product_name_customer_id;'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_bootstrap_translation_key;'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS uix_mc_sale_customer_id_date;'))
      /*
       * Old indexes are recreated if something goes wrong
       */
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_area_name_customer_id ON area(customer_id, name)'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_category_name_customer_id ON product_category(customer_id, name)'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_name_customer_id ON product(customer_id, name)'))
      /*
       * temp table to fix sales data is deleted in case it exists
       */
      .then(() => queryInterface.sequelize.query('DROP TABLE IF EXISTS tmp_sale;'))


  }
};
