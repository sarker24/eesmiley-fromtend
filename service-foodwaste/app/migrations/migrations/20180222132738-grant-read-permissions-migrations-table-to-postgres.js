'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('GRANT SELECT ON TABLE _migrations TO postgres')
      .then(()=>{
        return queryInterface.sequelize.query('grant select on sequence _migrations_id_seq to postgres');
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('REVOKE SELECT ON TABLE _migrations FROM postgres')
      .then(()=>{
        return queryInterface.sequelize.query('REVOKE SELECT ON SEQUENCE _migrations_id_seq FROM postgres');
      });
  }
};
