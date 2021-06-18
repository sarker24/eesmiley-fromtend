
module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    // no need for app to have access
    return sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE project_registration_point TO postgres');
  },

  down: (queryInterface, Sequelize) => {
  }
};
