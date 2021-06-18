/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize: any, Sequelize: any) {
  const guestRegistration = sequelize.define('guest_registration',
    {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      guestTypeId: {
        field: 'guest_type_id',
        type: Sequelize.BIGINT,
        allowNull: true
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

  guestRegistration.prototype.toJSON = function () {
    let values = { ...this.get() };

    if (values.hasOwnProperty('guestType') && values.hasOwnProperty('guestTypeId')) {
      delete values.guestTypeId;
    }

    if (values.guestType === null) {
      delete values.guestType;
    }

    return values;
  };

  guestRegistration.associate = models => {
    guestRegistration.belongsTo(models.guest_type, { foreignKey: 'guestTypeId', as: 'guestType' });
  };

  guestRegistration.addScope('includeGuestType', {
    attributes: { exclude: ['guestTypeId'] },
    include: [{
      attributes: ['id', 'name', 'image', 'active', 'deletedAt'],
      model: sequelize.models.guest_type,
      paranoid: false,
      as: 'guestType'
    }]
  });

  return guestRegistration;
}
