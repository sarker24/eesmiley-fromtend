'use strict';
/*
 * Some freaking nasty SQL to ensure unique values before migration can run.
 * Please do not run SQL like this in heavy tables, it makes use of sub-select which doesn't perform well.
 * Also, run such operations on fresh dumpt in staging environment before enering production (obviously)!
 */
module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
     * Mig1: ix_mc_area_name_customer_id ON area(customer_id, name)
     */
    return        queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_area_name_customer_id ON area(customer_id, name);')

      /*
       * Mig2: ix_mc_product_category_name_customer_id ON product_category(customer_id, name)
       */
      .then(() => queryInterface.sequelize.query('DROP TABLE IF EXISTS tmp_product_category;'))
      .then(() => queryInterface.sequelize.query('CREATE TABLE tmp_product_category AS SELECT * FROM product_category;'))
      .then(() => queryInterface.sequelize.query('TRUNCATE TABLE tmp_product_category;'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_category_name_customer_id ON tmp_product_category(customer_id, name);'))
      // first time to prioritize those with a relation
      .then(() => queryInterface.sequelize.query('INSERT INTO tmp_product_category SELECT * from product_category WHERE id IN (SELECT category_id FROM product) ON CONFLICT DO NOTHING;'))
      // second time to get those that has not been used before
      .then(() => queryInterface.sequelize.query('INSERT INTO tmp_product_category SELECT * from product_category ON CONFLICT DO NOTHING;'))
      .then(() => queryInterface.sequelize.query('UPDATE product p SET category_id = (\
          SELECT id FROM tmp_product_category tpc WHERE\
           customer_id = (SELECT customer_id FROM product_category WHERE id = p.category_id LIMIT 1) AND \
           name = (SELECT name FROM product_category WHERE id = p.category_id LIMIT 1)\
          LIMIT 1);'))
      .then(() => queryInterface.sequelize.query('DELETE FROM product_category WHERE id NOT IN (SELECT id from tmp_product_category);'))
      .then(() => queryInterface.sequelize.query('DROP TABLE IF EXISTS tmp_product_category;'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_category_name_customer_id ON product_category(customer_id, name);'))

      /*
       * Mig3: ix_mc_product_name_customer_id ON product(customer_id, name)
       */
      .then(() => queryInterface.sequelize.query('DROP TABLE IF EXISTS tmp_product;'))
      .then(() => queryInterface.sequelize.query('CREATE TABLE tmp_product AS SELECT * FROM product;'))
      .then(() => queryInterface.sequelize.query('TRUNCATE TABLE tmp_product;'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_name_customer_id ON tmp_product(customer_id, name);'))
      .then(() => queryInterface.sequelize.query('INSERT INTO tmp_product SELECT * from product WHERE id IN (SELECT product_id FROM registration) ON CONFLICT DO NOTHING;'))
      .then(() => queryInterface.sequelize.query('INSERT INTO tmp_product SELECT * from product ON CONFLICT DO NOTHING;'))
      .then(() => queryInterface.sequelize.query('UPDATE registration r SET product_id = (\
          SELECT id FROM tmp_product tp WHERE\
           customer_id = (SELECT customer_id FROM product WHERE id = r.product_id LIMIT 1) AND \
           name = (SELECT name FROM product WHERE id = r.product_id LIMIT 1)\
          LIMIT 1);'))
      .then(() => queryInterface.sequelize.query('DELETE FROM product WHERE id NOT IN (SELECT id from tmp_product);'))
      .then(() => queryInterface.sequelize.query('DROP TABLE IF EXISTS tmp_product;'))
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_product_name_customer_id ON product(customer_id, name);'))

      /*
       * Mig4: ix_mc_project_registration_project_id_registration_id ON project_registration(project_id, registration_id)
       */
      .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_project_registration_project_id_registration_id ON project_registration(project_id, registration_id);'))
  },

  down: function (queryInterface, Sequelize) {
    return        queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_area_name_customer_id;')
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_product_category_name_customer_id;'))
      .then(() => queryInterface.sequelize.query('DROP TABLE IF EXISTS tmp_product_category;'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_product_name_customer_id;'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_project_registration_project_id_registration_id;'))
  }
};
