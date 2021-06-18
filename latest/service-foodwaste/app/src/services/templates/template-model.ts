/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize: any, Sequelize: any) {
  const template = sequelize.define('template', {
    id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

    templateAccountId: {
      field: 'template_account_id',
      type: Sequelize.BIGINT,
      allowNull: false
    },

    name: {
      type: Sequelize.STRING(255),
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
  } as any, {
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
  } as any);

  template.prototype.toJSON = function () {
    const values = { ...this.get() };
    return { ...values, id: parseInt(values.id) };
  };

  return template;

}
