'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE backup_registration_point TO postgres')
      .then(() => sequelize.query('GRANT SELECT, UPDATE ON SEQUENCE backup_registration_point_id_seq TO postgres'))
      .then(() => sequelize.query('REVOKE INSERT, UPDATE, DELETE ON project_registration_point FROM postgres'));
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('REVOKE SELECT, INSERT, UPDATE, DELETE ON backup_registration_point FROM postgres')
      .then(() => sequelize.query('REVOKE SELECT, UPDATE ON SEQUENCE backup_registration_point_id_seq FROM postgres'));

  }
};
