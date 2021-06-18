'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("SELECT id, current FROM SETTINGS",
      { type: queryInterface.sequelize.QueryTypes.SELECT })
      .then((settings) => {
        let promises = [];

        settings.forEach((settingElement) => {
          settingElement.current['bootstrapData'] = true;

          promises.push(
            queryInterface.sequelize.query('UPDATE settings SET current=:current WHERE id=:id', {
              replacements: { current:  JSON.stringify(settingElement.current), id: parseInt(settingElement.id) },
              type: queryInterface.sequelize.QueryTypes.UPDATE
            })
          );
        });

        return Promise.all(promises);
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("SELECT id, current FROM SETTINGS")
      .then((settings) => {
        let promises = [];

        settings.forEach((settingElement) => {
          delete settingElement.current;
          
          promises.push(
            queryInterface.sequelize.query('UPDATE settings SET current=:current WHERE id=:id', {
              replacements: { current: JSON.stringify(settingElement.current), id: parseInt(settingElement.id) },
              type: queryInterface.sequelize.QueryTypes.UPDATE
            })
          );

        });
        return Promise.all(promises);
      })  }
};
