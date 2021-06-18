"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query(
      "INSERT INTO product(" +
      "parent_product_id, path, user_id, customer_id, name, cost, image, active, " +
      "amount, cost_per_kg, bootstrap_key, deleted_at, updated_at, created_at, " +
      "old_model_id, old_model_type)" +
      "SELECT area.id, area.id::text::ltree, prod.user_id, prod.customer_id, prod.name, prod.cost, prod.image, prod.active, " +
      "prod.amount, prod.cost_per_kg, prod.bootstrap_key, prod.deleted_at, prod.updated_at, prod.created_at, " +
      "prod.id, 'product' " +
      "FROM product_old prod " +
      "join product area on area.customer_id = prod.customer_id " +
      "WHERE area.old_model_type = 'area' AND prod.category_id IS NULL " +
      "AND (prod.deleted_at IS NULL or prod.id in (select distinct product_id from registration))");
  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query("DELETE FROM product WHERE old_model_type='product'")
      .then(sequelize.query("SELECT id FROM product WHERE old_model_type='category' ORDER BY id DESC LIMIT 1"))
      .then(area => {
        return sequelize.query("ALTER SEQUENCE product_id_seq RESTART WITH :seqNumber", {
          replacements: { seqNumber: +area[0].id + 1 },
          type: sequelize.QueryTypes.UPDATE
        })
      })
      .then(sequelize.query(
        "ALTER TABLE product ALTER COLUMN id SET DEFAULT nextval('product_id_seq'::regclass)"
      ));
  }
};
