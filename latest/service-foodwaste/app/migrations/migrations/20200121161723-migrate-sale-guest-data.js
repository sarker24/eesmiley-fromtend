'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    return sequelize.query(
      'INSERT INTO guest_registration (' +
      'user_id,' +
      'customer_id,' +
      'date,' +
      'amount,' +
      'created_at,' +
      'updated_at,' +
      'deleted_at' +
      ') SELECT ' +
      'user_id,' +
      'customer_id,' +
      'date,' +
      'guests,' +
      'created_at,' +
      'updated_at,' +
      'deleted_at' +
      ' FROM sale'
    );
  },

  down: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    return sequelize.query('DELETE FROM guest_registration');
  }
};
