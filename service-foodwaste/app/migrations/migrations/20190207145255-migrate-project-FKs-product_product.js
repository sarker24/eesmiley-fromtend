'use strict';

/**
 * Traverse all product json arrays in each project and update the id to refer to the new
 * ids in the product table. If product doesnt exist anymore (eg in some test accounts),
 * it is filtered out. If none of products are exist, they are replaced with an empty array. Two cases:
 *
 * 1. project has areas => update old products to refer to new products with matching old_model_id that have the area id(s) on their path
 * 2. project has no areas => update products to refer to all new products with matching old_model_id
 *
 */

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query("UPDATE project SET product = project_update.products " +
      "FROM (SELECT update.project_id, COALESCE(json_agg(update.new_product) FILTER (WHERE update.new_product IS NOT NULL), '[]') AS products FROM ( " +
      "SELECT project.id AS project_id, CASE WHEN product.id is null THEN null ELSE proj_products.product || jsonb_build_object('id', product.id) END AS new_product FROM project " +
      "JOIN LATERAL jsonb_array_elements(project.product) proj_products(product) ON TRUE " +
      "LEFT JOIN LATERAL jsonb_array_elements(project.area) proj_areas(area) ON TRUE " +
      "LEFT JOIN product ON (subpath(product.path, 0, 1)::text = proj_areas.area->>'id' OR jsonb_array_length(project.area::jsonb) = 0) AND product.old_model_type='product' AND product.customer_id = project.customer_id AND product.old_model_id = (proj_products.product->>'id')::text::bigint) AS update " +
      "GROUP BY update.project_id) AS project_update " +
      "WHERE project.id = project_update.project_id", {
      type: sequelize.QueryTypes.UPDATE
    });
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
