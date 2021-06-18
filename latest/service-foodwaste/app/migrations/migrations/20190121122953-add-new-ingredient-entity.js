'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const createTableSQL =
      " CREATE TABLE ingredient ( " +
      "     id BIGSERIAL PRIMARY KEY, " +
      "     customer_id bigint NOT NULL, " +
      "     name character varying(255) NOT NULL, " +
      "     cost integer NOT NULL, " +
      "     amount integer NOT NULL DEFAULT 1000, " +
      "     unit character varying(15) NOT NULL DEFAULT 'kg'::character varying, " +
      "     currency character varying(3) NOT NULL DEFAULT 'DKK'::character varying, " +
      "     bootstrap_key character varying(255), " +
      "     deleted_at timestamp with time zone DEFAULT NULL, " +
      "     updated_at timestamp with time zone NOT NULL DEFAULT now(), " +
      "     created_at timestamp with time zone NOT NULL DEFAULT now(), " +
      '     old_model_id bigint ' +
      " ); ";

    return queryInterface.sequelize.query(createTableSQL);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ingredient');
  }
};
