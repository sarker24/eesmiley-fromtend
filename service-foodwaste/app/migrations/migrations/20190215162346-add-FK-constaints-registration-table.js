'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    return sequelize.query('ALTER TABLE registration ADD CONSTRAINT fk_registration_product_area_id ' +
      'FOREIGN KEY (area_id) REFERENCES product(id) ON UPDATE CASCADE')
      .then(sequelize.query('ALTER TABLE registration ADD CONSTRAINT fk_registration_product_product_id ' +
        'FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE'));
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
