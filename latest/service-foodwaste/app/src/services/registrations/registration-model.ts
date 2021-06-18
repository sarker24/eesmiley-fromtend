/* istanbul ignore file */

const moment = require('moment');

const TYPE_KILOGRAM: string = 'kg';
const TYPE_LITER: string = 'lt';

export default function (sequelize, Sequelize) {

  const registration = sequelize.define('registration',
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
        allowNull: false
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      userId: {
        field: 'user_id',
        type: Sequelize.BIGINT,
        allowNull: false
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      unit: {
        type: Sequelize.ENUM(TYPE_KILOGRAM, TYPE_LITER),
        allowNull: false,
        defaultValue: TYPE_KILOGRAM
      },

      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'DKK'
      },

      kgPerLiter: {
        field: 'kg_per_liter',
        type: Sequelize.INTEGER,
        allowNull: true
      },

      cost: {
        type: Sequelize.BIGINT,
        allowNull: true
      },

      co2: {
        type: Sequelize.BIGINT,
        allowNull: true
      },

      comment: {
        field: 'customer_comment',
        type: Sequelize.TEXT,
        allowNull: true
      },

      manual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      scale: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },

      updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },

      createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },

      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE,
        allowNull: true
      },

      registrationPointId: {
        field: 'registration_point_id',
        type: Sequelize.BIGINT,
        allowNull: false
      }
    } as any,
    {
      freezeTableName: true,
      timestamps: true,
      paranoid: true,

      indexes: [
        {
          name: 'ix_mc_registration_date_customer_id',
          fields: ['customer_id', 'date']
        },
        {
          name: 'ix_registration_user_id',
          fields: ['user_id']
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

  registration.TYPE_KILOGRAM = TYPE_KILOGRAM;
  registration.TYPE_LITER = TYPE_LITER;

  registration.associate = (models) => {
    registration.belongsTo(models.registration_point, {
      as: 'registrationPoint',
      foreignKey: 'registrationPointId'
    });
    registration.belongsToMany(models.project, {
      as: 'Projects',
      through: 'project_registration',
      timestamps: false,
      foreignKey: 'registration_id'
    });
  };

  return registration;
}
