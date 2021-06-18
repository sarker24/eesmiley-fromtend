'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.sequelize.query('ALTER TABLE public.product_category RENAME TO category')
    .then(() => queryInterface.sequelize.query('ALTER TABLE public.product DROP CONSTRAINT IF EXISTS fk_product_product_category_category_id'))
    .then(() => queryInterface.sequelize.query('ALTER TABLE public.product ADD CONSTRAINT fk_product_category_category_id FOREIGN KEY (category_id) REFERENCES category(id)'))
    .then(() => queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS ix_mc_category_name_customer_id ON category(customer_id, name);'))
    .then(() => queryInterface.sequelize.query('ALTER SEQUENCE product_category_id_seq RENAME TO category_id_seq'))
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.category RENAME TO product_category')
      .then(() => queryInterface.sequelize.query('ALTER TABLE public.product DROP CONSTRAINT IF EXISTS fk_product_category_category_id FOREIGN KEY (category_id) REFERENCES category(id)'))
      .then(() => queryInterface.sequelize.query('ALTER TABLE public.product ADD CONSTRAINT  fk_product_product_category_category_id FOREIGN KEY (category_id) REFERENCES product_category(id)'))
      .then(() => queryInterface.sequelize.query('DROP INDEX IF EXISTS ix_mc_category_name_customer_id;'))

  }
};
