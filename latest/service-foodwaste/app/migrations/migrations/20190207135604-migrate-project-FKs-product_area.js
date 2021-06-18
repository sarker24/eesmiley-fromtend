'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;
    let projectsOriginal;

    return sequelize.query('select id, area from project where jsonb_array_length(area::jsonb)>0;', {
      type: sequelize.QueryTypes.SELECT
    })
      .then(projects => {
        projectsOriginal = projects;
        const areaIds = [];

        for (const proj of projects) {
          for (const area of proj.area) {
            areaIds.push(+area.id);
          }
        }

        return areaIds;
      })
      .then((areaIds) => {
        return sequelize.query("select id as new_id, old_model_id as old_id from product " +
          "where old_model_id in (:areaIds) and old_model_type='area'",
          {
            replacements: { areaIds },
            type: sequelize.QueryTypes.SELECT
          })
      })
      .then(areasOriginal => {
        const areasNew = {};
        const promises = [];

        for (const area of areasOriginal) {
          areasNew[area.old_id] = +area.new_id;
        }

        for (const project of projectsOriginal) {
          for (const area of project.area) {
            area.id = +areasNew[area.id];
          }

          promises.push(
            sequelize.query("UPDATE project SET area=:areaNew WHERE id=:projectId", {
              type: sequelize.QueryTypes.UPDATE,
              replacements: {
                areaNew: JSON.stringify(project.area),
                projectId: +project.id
              }
            })
          )
        }

        return Promise.all(promises);
      });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
