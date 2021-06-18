'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query(
      'CREATE TABLE project_registration_point (' +
      'project_id bigint NOT NULL, ' +
      'registration_point_id bigint NOT NULL, ' +
      'include_children boolean DEFAULT TRUE, ' +
      'PRIMARY KEY (project_id, registration_point_id), ' +
      'CONSTRAINT fk_project_registration_point_registration_point_id FOREIGN KEY (registration_point_id) REFERENCES registration_point (id) ON DELETE CASCADE, ' +
      'CONSTRAINT fk_project_registration_point_project_id FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE' +
      ')'
    )
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('ALTER TABLE project_registration_point DROP CONSTRAINT fk_project_registration_point_registration_point_id').then(
      sequelize.query('ALTER TABLE project_registration_point DROP CONSTRAINT fk_project_registration_point_project_id')
    ).then(
      sequelize.query('DROP TABLE project_registration_point')
    );
  }
};
