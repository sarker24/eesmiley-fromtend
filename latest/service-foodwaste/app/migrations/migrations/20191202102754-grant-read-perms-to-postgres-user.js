'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return (queryInterface.sequelize.query('GRANT SELECT ON ingredient TO postgres'))
      .then(queryInterface.sequelize.query('GRANT SELECT ON SEQUENCE ingredient_id_seq TO postgres'))
      .then(queryInterface.sequelize.query('GRANT SELECT ON registration_point TO postgres'))
      .then(queryInterface.sequelize.query('GRANT SELECT ON SEQUENCE registration_point_id_seq TO postgres'))
      .then(queryInterface.sequelize.query('GRANT SELECT ON registration_point_ingredient TO postgres'))
      .then(queryInterface.sequelize.query('GRANT SELECT ON project_registration_point TO postgres'))
      .then(queryInterface.sequelize.query('GRANT SELECT ON project_old TO postgres'))
      .catch(err => {
        console.log(err);
      });
  },

  down: (queryInterface, Sequelize) => {
    return (queryInterface.sequelize.query('REVOKE SELECT ON ingredient FROM postgres'))
      .then(queryInterface.sequelize.query('REVOKE SELECT ON SEQUENCE ingredient_id_seq FROM postgres'))
      .then(queryInterface.sequelize.query('REVOKE SELECT ON registration_point FROM postgres'))
      .then(queryInterface.sequelize.query('REVOKE SELECT ON SEQUENCE registration_point_id_seq FROM postgres'))
      .then(queryInterface.sequelize.query('REVOKE SELECT ON registration_point_ingredient FROM postgres'))
      .then(queryInterface.sequelize.query('REVOKE SELECT ON project_registration_point FROM postgres'))
      .then(queryInterface.sequelize.query('REVOKE SELECT ON project_old FROM postgres'))
      .catch(err => {
        console.log(err);
      });
  }
};
