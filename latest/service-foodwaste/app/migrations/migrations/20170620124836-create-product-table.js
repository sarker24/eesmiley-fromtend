'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('product', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      customer_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      cost: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      image: {
        type: Sequelize.BLOB,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }).then(() => {
      return queryInterface.sequelize.query('ALTER TABLE product ADD CONSTRAINT ' +
        'fk_product_product_category_category_id FOREIGN KEY (category_id) REFERENCES product_category(id)')
      // NO ACTION for the FK ON DELETE - this means an error will be produced if category is to be deleted
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('product');
  }
};
