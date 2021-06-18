'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query(
      "UPDATE registration_point SET deleted_at=now() WHERE id IN (" +
      "SELECT p.id FROM registration_point p " +
      "JOIN (SELECT customer_id FROM settings WHERE current->'categoriesHidden' = 'true') AS customer " +
      "ON customer.customer_id = p.customer_id " +
      "WHERE p.label = 'category')");
  },

  down: (queryInterface, Sequelize) => {
    return sequelize.query(
      "UPDATE registration_point SET deleted_at = null WHERE label='category' AND id IN (" +
      "SELECT p.id FROM backup_registration_point p " +
      "JOIN (SELECT customer_id FROM settings WHERE current->'categoriesHidden' = 'true') AS customer " +
      "ON customer.customer_id = p.customer_id " +
      "WHERE p.label = 'category' AND p.deleted_at IS NULL)");
  }
};
