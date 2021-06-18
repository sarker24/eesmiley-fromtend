module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query(
      "UPDATE registration_point point_with_cat_parent SET parent_id = category.parent_id, path = category.path " +
      "FROM registration_point p " +
      "JOIN (SELECT customer_id FROM settings WHERE current->'categoriesHidden' = 'true') as customer " +
      "ON customer.customer_id = p.customer_id " +
      "JOIN (SELECT id, parent_id, path FROM registration_point categories WHERE categories.label = 'category') as category " +
      "ON p.parent_id = category.id " +
      "WHERE point_with_cat_parent.id = p.id")
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query(
      "UPDATE registration_point point_with_cat_parent SET parent_id = category.id, path = coalesce(category.path || category.id::text::ltree, category.id::text::ltree) " +
      "FROM backup_registration_point p " +
      "JOIN (SELECT customer_id FROM settings WHERE current->'categoriesHidden' = 'true') as customer " +
      "ON customer.customer_id = p.customer_id " +
      "JOIN (SELECT id, parent_id, path FROM backup_registration_point categories WHERE categories.label = 'category') as category " +
      "ON p.parent_id = category.id " +
      "WHERE point_with_cat_parent.id = p.id")
  }
};
