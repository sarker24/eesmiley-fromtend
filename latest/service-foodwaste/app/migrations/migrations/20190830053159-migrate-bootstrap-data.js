'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("DROP INDEX idx_bootstrap_translation_key")
    /* set cost to areas */
      .then(() => sequelize.query("update bootstrap set value = jsonb_set(area.value, '{properties, cost}', jsonb_build_object('DKK', product.avg_dkk::text::jsonb, 'NOK', product.avg_nok::text::jsonb), true) " +
        "from bootstrap area join (select avg((value->'properties'->'cost'->'DKK')::text::int)::int as avg_dkk, avg((value->'properties'->'cost'->'NOK')::text::int)::int as avg_NOK from bootstrap where value->>'type' = 'product') as product on true " +
        "where area.value->>'type' = 'area' and bootstrap.id = area.id;"))
      /* set cost to categories */
      .then(() => sequelize.query("update bootstrap set value = jsonb_set(category.value, '{properties, cost}', jsonb_build_object('DKK', product.avg_dkk::text::jsonb, 'NOK', product.avg_nok::text::jsonb), true) " +
        "from bootstrap category join (select value->'properties'->>'categoryId' as category_id, avg((value->'properties'->'cost'->'DKK')::text::int)::int as avg_dkk, avg((value->'properties'->'cost'->'NOK')::text::int)::int as avg_NOK from bootstrap where value->>'type' = 'product' group by category_id) as product " +
        "on product.category_id::text = category.translation_key " +
        "where category.value->>'type' = 'category' and bootstrap.id = category.id"))
      /* insert categories for each area */
      .then(() => sequelize.query("insert into bootstrap (translation_key, parent_id, path, value, updated_at, created_at) " +
        "select category.translation_key, area.id, area.id::text::ltree, category.value, category.updated_at, category.created_at from bootstrap category join bootstrap area on area.value->>'type'='area'" +
        "where category.value->>'type'='category'"))
      /* insert product for each area/category */
      .then(() => sequelize.query("insert into bootstrap (translation_key, parent_id, path, value, updated_at, created_at) " +
        "select product.translation_key, category.id, category.path || category.id::text, product.value, product.updated_at, product.created_at from bootstrap product join bootstrap category on " +
        "category.translation_key = product.value->'properties'->>'categoryId' " +
        "where category.parent_id is not null and product.value->>'type'='product'"))
      /* delete old category and product duplicates */
      .then(() => sequelize.query("delete from bootstrap where parent_id is null and value->>'type' != 'area'"))
      /* update type to registration point */
      .then(() => sequelize.query("update bootstrap set value=jsonb_set(value, '{type}', to_jsonb('registrationPoint'::text)) where value->>'type' in ('area', 'category', 'product')"))
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
