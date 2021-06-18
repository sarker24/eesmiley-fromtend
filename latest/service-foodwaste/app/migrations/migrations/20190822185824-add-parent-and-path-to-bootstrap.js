'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("ALTER TABLE bootstrap ADD COLUMN parent_id BIGINT REFERENCES bootstrap (id)")
      .then(() =>
        sequelize.query("ALTER TABLE bootstrap ADD COLUMN path LTREE"))
      .then(() =>
        sequelize.query("CREATE INDEX bootstrap_path_idx ON bootstrap USING GIST (path)"));

  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("DROP INDEX bootstrap_path_idx")
      .then(() =>
        sequelize.query("ALTER TABLE bootstrap DROP COLUMN path"))
      .then(() =>
        sequelize.query("ALTER TABLE bootstrap DROP COLUMN parent_id"));
  }
};
