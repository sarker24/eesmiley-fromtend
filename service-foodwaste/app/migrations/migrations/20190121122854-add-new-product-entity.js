'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const createTableSQL =
      ' CREATE TABLE product ( ' +
      '     id BIGSERIAL PRIMARY KEY, ' +
      '     parent_product_id bigint REFERENCES product(id) ON UPDATE CASCADE, ' +
      '     path ltree, ' +
      '     user_id bigint, ' +
      '     customer_id bigint NOT NULL, ' +
      '     name character varying(255) NOT NULL, ' +
      '     cost integer DEFAULT 0, ' +
      '     image jsonb, ' +
      '     active boolean NOT NULL DEFAULT true, ' +
      '     amount integer DEFAULT 1000, ' +
      '     cost_per_kg integer, ' +
      '     bootstrap_key character varying(255), ' +
      '     deleted_at timestamp with time zone DEFAULT NULL, ' +
      '     updated_at timestamp with time zone NOT NULL DEFAULT now(), ' +
      '     created_at timestamp with time zone NOT NULL DEFAULT now(), ' +
      '     old_model_id bigint, ' +
      '     old_model_type old_model_type, ' +
      '     category_id bigint REFERENCES product(id) ON UPDATE CASCADE ' +
      ' ); ';

    return queryInterface.sequelize.query(createTableSQL);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('product');
  }
};
