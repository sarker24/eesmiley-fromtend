"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("CREATE TABLE project_old (" +
      "    id BIGSERIAL PRIMARY KEY, " +
      "    parent_project_id bigint, " +
      "    user_id bigint, " +
      "    customer_id bigint, " +
      "    name character varying(255) NOT NULL, " +
      "    duration jsonb NOT NULL, " +
      "    status project_status_type NOT NULL DEFAULT 'PENDING_START'::project_status_type, " +
      "    area jsonb NOT NULL, " +
      "    product jsonb NOT NULL, " +
      "    action jsonb, " +
      "    updated_at timestamp with time zone NOT NULL DEFAULT now(), " +
      "    created_at timestamp with time zone NOT NULL DEFAULT now(), " +
      "    deleted_at timestamp with time zone, " +
      "    active boolean NOT NULL DEFAULT true, " +
      "    period integer DEFAULT 1 " +
      ")")
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("DROP TABLE project_old");
  }
};
