'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('sale',
      {
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
        date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        income: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        portions: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        portion_price: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        guests: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        production_cost: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        production_weight: {
          type: Sequelize.REAL,
          allowNull: false
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
      })
      .then(() => {
        return queryInterface.sequelize.query('GRANT SELECT ON TABLE sale TO foodwaste_read');
      })
      .then(() => {
        return queryInterface.sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sale TO foodwaste_app');
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('sale');
  }
};
