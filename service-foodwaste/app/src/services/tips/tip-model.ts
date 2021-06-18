/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize: any, Sequelize: any) {
  const tip = sequelize.define('tip',
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
      imageUrl: {
        field: 'image_url',
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        field: 'is_active',
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE,
        allowNull: true
      }
    } as any,
    {
      freezeTableName: true,
      timestamps: true,
      paranoid: true,

      indexes: [
        {
          name: 'ix_tip_title',
          fields: ['title'],
          using: 'gin'
        },
        {
          name: 'ix_tip_content',
          fields: ['content'],
          using: 'gin'
        },
        {
          name: 'ix_tip_is_active',
          fields: ['is_active']
        }
      ],

      getterMethods: {
        createdAt: function () {
          return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:MM:ss');
        },
        updatedAt: function () {
          return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:MM:ss');
        },
        deletedAt: function () {
          return this.getDataValue('deletedAt') ?
            moment(this.getDataValue('deletedAt')).format('YYYY-MM-DD HH:MM:ss') : null;
        }
      }
    } as any
  );

  return tip;
}
