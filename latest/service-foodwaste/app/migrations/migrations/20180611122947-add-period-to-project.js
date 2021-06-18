'use strict';

module.exports = {
  /**
   * The migration adds the `period` column and updates all existing records to have the correct period value
   */
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return queryInterface.sequelize.query("ALTER TABLE project ADD COLUMN IF NOT EXISTS period INTEGER DEFAULT 1")
      .then(() => {
        /*
         * The `ORDER BY id` will ensure that we get the projects in ASC order, so we can easily figure out which
         * followUp project corresponds to which period
         */
        return sequelize.query('SELECT id, parent_project_id FROM project ORDER BY id',
          { type: sequelize.QueryTypes.SELECT });
      })
      .then(projects => {
        let filteredProjects = {};

        projects.forEach(project => {
          const parentId = project.parent_project_id;
          if (parentId === null) {
            return;
          }

          if (filteredProjects[parentId] === undefined) {
            filteredProjects[parentId] = [project.id];
          } else {
            filteredProjects[parentId].push(project.id);
          }
        });

        let promises = [];

        Object.keys(filteredProjects).forEach((parentId) => {
          const followUpProjects = filteredProjects[parentId];

          promises.push(sequelize.query('UPDATE project SET period=:period WHERE id=:id', {
            replacements: { period: followUpProjects.length + 1, id: parseInt(parentId) },
            type: sequelize.QueryTypes.UPDATE
          }));

          followUpProjects.forEach((followUpId, index) => {
            promises.push(sequelize.query('UPDATE project SET period=:period WHERE id=:id', {
              replacements: { period: index + 2, id: parseInt(followUpId) },
              type: sequelize.QueryTypes.UPDATE
            }));
          });
        });

        return Promise.all(promises);
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'project',
      'period'
    );
  }
};
