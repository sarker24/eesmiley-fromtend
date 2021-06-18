/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize: any, Sequelize: any) {
  const ingredient = sequelize.define('ingredient',
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      customerId: {
        field: 'customer_id',
        type: Sequelize.BIGINT,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      cost: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(100),
        defaultValue: 'kg',
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'DKK',
        allowNull: false
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1
      },
      bootstrapKey: {
        field: 'bootstrap_key',
        type: Sequelize.STRING(255),
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
      }
    } as any,
    {
      freezeTableName: true,
      timestamps: true,

      indexes: [
        {
          name: 'uix_mc_ingredient_old_customer_id_name',
          unique: true,
          fields: ['customer_id', 'name']
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

  return ingredient;
}
