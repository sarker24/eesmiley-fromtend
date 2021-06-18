'use strict';

/*
* back up points before deleting categories for users who have categoriesHidden flag set true in settings
* */
module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("CREATE TABLE backup_registration_point (" +
      "    id BIGSERIAL PRIMARY KEY," +
      "    parent_id bigint REFERENCES registration_point(id) ON UPDATE CASCADE," +
      "    path ltree," +
      "    user_id bigint," +
      "    customer_id bigint NOT NULL," +
      "    name character varying(255) NOT NULL," +
      "    cost integer DEFAULT 0," +
      "    image jsonb," +
      "    active boolean NOT NULL DEFAULT true," +
      "    amount integer DEFAULT 1000," +
      "    cost_per_kg integer," +
      "    bootstrap_key character varying(255)," +
      "    deleted_at timestamp with time zone," +
      "    updated_at timestamp with time zone NOT NULL DEFAULT now()," +
      "    created_at timestamp with time zone NOT NULL DEFAULT now()," +
      "    old_model_id bigint," +
      "    label registration_point_label," +
      "    category_id bigint" +
      ")");
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("DROP TABLE backup_registration_point");
  }
};
