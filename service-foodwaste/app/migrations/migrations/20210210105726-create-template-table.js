'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query(
      'CREATE TABLE template (' +
      'id BIGSERIAL PRIMARY KEY,' +
      'name CHARACTER VARYING(255) NOT NULL,' +
      'template_account_id BIGINT NOT NULL,' +
      'updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),' +
      'created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),' +
      'deleted_at TIMESTAMP WITH TIME ZONE' +
      ')'
    )
      .then(() => sequelize.query('GRANT SELECT ON TABLE template TO postgres'))
      .then(() => sequelize.query('GRANT SELECT ON TABLE template TO foodwaste_read'))
      .then(() => sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE template TO foodwaste_app'))
      .then(() => sequelize.query('GRANT SELECT ON SEQUENCE template_id_seq TO postgres'))
      .then(() => sequelize.query('GRANT SELECT ON SEQUENCE template_id_seq TO foodwaste_read'))
      .then(() => sequelize.query('GRANT SELECT, USAGE ON SEQUENCE template_id_seq TO foodwaste_app'));
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE template FROM foodwaste_app')
      .then(() => sequelize.query('REVOKE SELECT ON TABLE template FROM foodwaste_read'))
      .then(() => sequelize.query('REVOKE SELECT ON TABLE template FROM postgres'))
      .then(() => sequelize.query('REVOKE SELECT, USAGE ON SEQUENCE template_id_seq FROM foodwaste_app'))
      .then(() => sequelize.query('REVOKE SELECT ON SEQUENCE template_id_seq FROM foodwaste_read'))
      .then(() => sequelize.query('REVOKE SELECT ON SEQUENCE template_id_seq FROM postgres'))
      .then(() => sequelize.query('DROP TABLE template'));
  }
};
