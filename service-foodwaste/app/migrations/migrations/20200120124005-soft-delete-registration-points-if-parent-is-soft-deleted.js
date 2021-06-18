'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    return sequelize.query(
      "TRUNCATE TABLE backup_registration_point"
    )
    .then(() => sequelize.query(
      "INSERT INTO backup_registration_point SELECT * from registration_point"
    ))
    .then(() => sequelize.query(
      "UPDATE registration_point child " +
      "SET deleted_at = root.deleted_at " +
      "FROM registration_point root " +
      "WHERE root.id::text::ltree = subpath(child.path, 0, 1) AND root.deleted_at IS NOT null AND child.deleted_at IS null;"
    ));
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    return sequelize.query(
      "UPDATE registration_point point " +
      "SET deleted_at = null " +
      "FROM ( " +
        "SELECT child.id " +
        "FROM backup_registration_point root " +
        "JOIN backup_registration_point child " +
        "ON root.id::text::ltree = subpath(child.path, 0, 1) AND root.deleted_at IS NOT null AND child.deleted_at IS null " +
      ") AS old_point " +
      "WHERE point.id = old_point.id;"
    );
  }
};
