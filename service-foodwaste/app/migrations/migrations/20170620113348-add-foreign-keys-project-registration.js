'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE project_registration ADD CONSTRAINT ' +
      'fk_project_registration_project_id FOREIGN KEY (project_id) REFERENCES project(id) ' +
      'ON DELETE CASCADE ON UPDATE CASCADE')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE project_registration ADD CONSTRAINT ' +
          'fk_project_registration_registration_id FOREIGN KEY (registration_id) REFERENCES registration(id) ' +
          'ON DELETE CASCADE ON UPDATE CASCADE')
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE project_registration DROP CONSTRAINT fk_project_registration_project_id')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE project_registration DROP CONSTRAINT fk_project_registration_registration_id');
      });
  }
};
