'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('tip',
      {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        title: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        content: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        image_url: {
          type: Sequelize.STRING,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
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
        return queryInterface.sequelize.query('GRANT SELECT ON TABLE tip TO foodwaste_read');
      })
      .then(() => {
        return queryInterface.sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE tip TO foodwaste_app');
      })
      .then(() => {
        return queryInterface.sequelize.query('CREATE INDEX ix_tip_title ON tip USING gin(title)');
      })
      .then(() => {
        return queryInterface.sequelize.query('CREATE INDEX ix_tip_content ON tip USING gin(content)');
      })
      .then(() => {
        return queryInterface.sequelize.query('CREATE INDEX ix_tip_is_active ON tip(is_active)');
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('tip');
  }
};
