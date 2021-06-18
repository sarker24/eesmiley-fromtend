
module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("UPDATE registration_point set cost=0, cost_per_kg=0 where label in ('area','category')");
  },

  down: (queryInterface, Sequelize) => {
  }
};
