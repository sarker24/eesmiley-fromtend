'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('project',
      {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        parent_project_id: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        user_id: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        customer_id: {
          type: Sequelize.BIGINT,
          allowNull: true
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        duration: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        status: {
          type: 'project_status_type',
          defaultValue: 'PENDING_START',
          allowNull: false
        },
        area: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        product: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        action: {
          type: Sequelize.JSONB,
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
      })
      .then(() => {
        return queryInterface.sequelize.query('CREATE INDEX ix_project_duration ON project USING gin(duration)');
      })
      .then(() => {
        return queryInterface.sequelize.query('CREATE INDEX ix_project_area ON project USING gin(area)');
      })
      .then(() => {
        return queryInterface.sequelize.query('CREATE INDEX ix_project_product ON project USING gin(product)');
      })
      .then(() => {
        return queryInterface.sequelize.query('CREATE INDEX ix_project_action ON project USING gin(action)');
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('DROP TABLE project'); // this will drop the indices as well
  }
};
