'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
     * There is a migration 201801121120000-add-icelandic-currency-to-bootstraps.js which has 1 too many 0s in the
     * timestamp part of the name, which makes it always stay at the end of the list of migrations files here in the
     * project.
     * With this migration we just add a row in the _migrations table with corrected name of the migration, so
     * at the next release we can rename that file and it will not be re-executed.
     */
    return queryInterface.sequelize.query(
      "INSERT INTO _migrations(name) VALUES ('20180112112000-add-icelandic-currency-to-bootstraps.js')"
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      "DELETE FROM _migrations WHERE name='20180112112000-add-icelandic-currency-to-bootstraps.js'"
    );
  }
};
