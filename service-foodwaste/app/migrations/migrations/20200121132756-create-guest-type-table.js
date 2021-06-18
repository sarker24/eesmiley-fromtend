'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query(
      'CREATE TABLE guest_type (' +
      'id BIGSERIAL PRIMARY KEY,' +
      'name CHARACTER VARYING(255) NOT NULL,' +
      'image JSONB,' +
      'active boolean NOT NULL DEFAULT true,' +
      'is_default boolean NOT NULL DEFAULT false,' +
      'user_id BIGINT,' +
      'customer_id BIGINT,' +
      'updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),' +
      'created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),' +
      'deleted_at TIMESTAMP WITH TIME ZONE' +
      ')'
    )
      .then(() => sequelize.query('GRANT SELECT ON TABLE guest_type TO postgres'))
      .then(() => sequelize.query('GRANT SELECT ON TABLE guest_type TO foodwaste_read'))
      .then(() => sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE guest_type TO foodwaste_app'))
      .then(() => sequelize.query('GRANT SELECT ON SEQUENCE guest_type_id_seq TO postgres'))
      .then(() => sequelize.query('GRANT SELECT ON SEQUENCE guest_type_id_seq TO foodwaste_read'))
      .then(() => sequelize.query('GRANT SELECT, USAGE ON SEQUENCE guest_type_id_seq TO foodwaste_app'));
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('REVOKE SELECT ON TABLE guest_type FROM postgres')
      .then(() => sequelize.query('REVOKE SELECT ON TABLE guest_type FROM foodwaste_read'))
      .then(() => sequelize.query('REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE guest_type FROM foodwaste_app'))
      .then(() => sequelize.query('REVOKE SELECT, USAGE ON SEQUENCE guest_type_id_seq FROM foodwaste_app'))
      .then(() => sequelize.query('REVOKE SELECT ON SEQUENCE guest_type_id_seq FROM foodwaste_read'))
      .then(() => sequelize.query('REVOKE SELECT ON SEQUENCE guest_type_id_seq FROM postgres'))
      .then(() => sequelize.query('DROP TABLE guest_type'));
  }
};
