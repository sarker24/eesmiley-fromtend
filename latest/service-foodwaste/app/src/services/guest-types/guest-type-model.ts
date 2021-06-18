/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize: any, Sequelize: any) {
  const guestType = sequelize.define('guest_type',
    {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      image: {
        type: Sequelize.JSONB,
        allowNull: true
      },

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      userId: {
        field: 'user_id',
        type: Sequelize.BIGINT,
        allowNull: false
      },

      customerId: {
        field: 'customer_id',
        type: Sequelize.BIGINT,
        allowNull: false
      },

      createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },

      updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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

  guestType.prototype.toJSON = function () {
    let values = { ...this.get() };
    if (values.image === null) {
      delete values.image;
    }

    /*
    we also have buildImageLink hook, but when we use
    sequelize to include guestType model, we cant use the hook.
    TODO: fix buildImageLink hook to support nested images / do we need store images as objects?
     */
    if (values.image && values.image.link) {
      values.image = values.image.link;
    }

    return values;
  };

  guestType.associate = models => {
    guestType.hasMany(models.guest_registration, { foreignKey: 'guestTypeId' });
  };

  return guestType;
}
