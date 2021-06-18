/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize, Sequelize) {
  const settings = sequelize.define('settings',
    {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      customerId: {
        field: 'customer_id',
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true
      },

      userId: {
        field: 'user_id',
        type: Sequelize.BIGINT,
        allowNull: false
      },

      current: {
        type: Sequelize.JSONB,
        allowNull: false
      },

      updateTime: {
        field: 'update_time',
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },

      createTime: {
        field: 'create_time',
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },

      history: {
        type: Sequelize.JSONB,
        allowNull: false
      }
    } as any,
    {
      freezeTableName: true,
      timestamps: true,

      updatedAt: 'updateTime',
      createdAt: 'createTime',

      indexes: [
        {
          name: 'uix_settings_customer_id',
          unique: true,
          fields: ['customer_id']
        },
        {
          name: 'ix_settings_user_id',
          fields: ['user_id']
        }
      ],

      getterMethods: {
        createTime: function () {
          return moment(this.getDataValue('createTime')).format('YYYY-MM-DD HH:MM:ss');
        },
        updateTime: function () {
          return moment(this.getDataValue('updateTime')).format('YYYY-MM-DD HH:MM:ss');
        }
      }
    } as any
  );

  return settings;
}
