"use strict";

/*
 populate project_registration_point with correct include children flag. Use cases:
 - no areas, no products => no record (project will include all old products and areas)
 - areas, no products => records with area id, include_children = true (include all products in the area)
 - areas, products => records with area and product id, include_children = false (only given specific ids are part of project)
 - no areas, products => records with product id, include_children = false
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("insert into project_registration_point (project_id, registration_point_id, include_children) " +
      "select project.id, registration_point.id, false from project " +
      "join lateral jsonb_array_elements(project.area) proj_areas(area) on true " +
      "left join registration_point on registration_point.id = (proj_areas.area->'id')::text::bigint " +
      "where jsonb_array_length( project.area ) != 0 and jsonb_array_length( project.product ) != 0")
      .then(sequelize.query("insert into project_registration_point (project_id, registration_point_id, include_children) " +
        "select project.id, registration_point.id, false from project " +
        "join lateral jsonb_array_elements(project.product) proj_products(product) on true " +
        "left join registration_point on registration_point.id = (proj_products.product->'id')::text::bigint " +
        "where jsonb_array_length( project.area ) != 0 and jsonb_array_length( project.product ) != 0"))
      .then(sequelize.query("insert into project_registration_point (project_id, registration_point_id, include_children) " +
        "select project.id, registration_point.id, true from project " +
        "join lateral jsonb_array_elements(project.area) proj_areas(area) on true " +
        "left join registration_point on registration_point.id = (proj_areas.area->'id')::text::bigint " +
        "where jsonb_array_length( project.area ) != 0 and jsonb_array_length( project.product ) = 0"))
      .then(sequelize.query("insert into project_registration_point (project_id, registration_point_id, include_children) " +
        "select project.id, registration_point.id, false from project " +
        "join lateral jsonb_array_elements(project.product) proj_products(product) on true " +
        "left join registration_point on registration_point.id = (proj_products.product->'id')::text::bigint " +
        "where jsonb_array_length( project.area ) = 0 and jsonb_array_length( project.product ) != 0"))
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("DELETE FROM project_registration_point")
  }
};
