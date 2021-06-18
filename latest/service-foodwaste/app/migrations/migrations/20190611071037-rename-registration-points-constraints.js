'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER INDEX product_path_idx RENAME TO registration_point_path_idx')
      .then(sequelize.query('ALTER SEQUENCE product_id_seq RENAME TO registration_point_id_seq'))
      .then(sequelize.query('ALTER INDEX product_pkey RENAME TO registration_point_pkey'));

  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER INDEX registration_point_path_idx RENAME TO product_path_idx')
      .then(sequelize.query('ALTER SEQUENCE registration_point_id_seq RENAME TO product_id_seq'))
      .then(sequelize.query('ALTER INDEX registration_point_pkey RENAME TO product_pkey'));
  }
};
