/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize: any, Sequelize: any) {
  const sale = sequelize.define('sale',
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        field: 'user_id',
        type: Sequelize.BIGINT,
        allowNull: true
      },
      customerId: {
        field: 'customer_id',
        type: Sequelize.BIGINT,
        allowNull: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      income: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0
      },
      portions: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      portionPrice: {
        field: 'portion_price',
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0
      },
      productionCost: {
        field: 'production_cost',
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0
      },
      productionWeight: {
        field: 'production_weight',
        type: Sequelize.REAL,
        allowNull: true,
        defaultValue: 0
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

      getterMethods: {
        date: function () {
          return moment(this.getDataValue('date')).format('YYYY-MM-DD');
        },
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

  return sale;
}
