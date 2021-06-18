'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query(
      "INSERT INTO product(" +
      "parent_product_id, path, user_id, customer_id, name, image, active, " +
      "bootstrap_key, deleted_at, updated_at, created_at, old_model_id, old_model_type) " +
      "SELECT area.id, area.id::text::ltree, category.user_id, category.customer_id, category.name, category.image, category.active, " +
      "category.bootstrap_key, category.deleted_at, category.updated_at, category.created_at, category.id, 'category' " +
      " FROM category join product area on area.customer_id = category.customer_id WHERE category.deleted_at IS NULL");
  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query("DELETE FROM product WHERE old_model_type='category'")
      .then(sequelize.query("SELECT id FROM product WHERE old_model_type='area' ORDER BY id DESC LIMIT 1"))
      .then(area => {
        return sequelize.query('ALTER SEQUENCE product_id_seq RESTART WITH :seqNumber', {
          replacements: { seqNumber: +area[0].id + 1 },
          type: sequelize.QueryTypes.UPDATE
        })
      })
      .then(sequelize.query(
        "ALTER TABLE product ALTER COLUMN id SET DEFAULT nextval('product_id_seq'::regclass)"
      ));
  }
};
