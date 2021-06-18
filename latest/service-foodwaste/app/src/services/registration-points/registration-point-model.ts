/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize: any, Sequelize: any) {
  const registrationPoint = sequelize.define('registration_point',
    {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      parentId: {
        field: 'parent_id',
        type: Sequelize.BIGINT,
        allowNull: true
      },

      path: {
        type: Sequelize.STRING,
        allowNull: true
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      cost: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },

      image: {
        type: Sequelize.JSONB,
        allowNull: true
      },

      userId: {
        field: 'user_id',
        type: Sequelize.BIGINT,
        allowNull: true
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000
      },

      costPerkg: {
        field: 'cost_per_kg',
        type: Sequelize.INTEGER,
        allowNull: false
      },

      customerId: {
        field: 'customer_id',
        type: Sequelize.BIGINT,
        allowNull: true
      },

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      bootstrapKey: {
        field: 'bootstrap_key',
        type: Sequelize.STRING(255),
        allowNull: true
      },

      label: {
        type: Sequelize.STRING,
        allowNull: false,
        // hardcoded default value for new reigstration points,
        // will be fixed in another PR, requires client changes
        defaultValue: 'product'
      },

      co2Perkg: {
        type: Sequelize.INTEGER,
        field: 'co2_per_kg',
        allowNull: true
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

  registrationPoint.associate = (models) => {
    registrationPoint.belongsTo(models.registration_point, {
      as: 'parent',
      foreignKey: 'parentId'
    });
    registrationPoint.hasMany(models.registration, {
      as: 'Registrations',
      foreignKey: 'registrationPointId'
    });
    registrationPoint.belongsToMany(models.project, {
      as: 'projects',
      through: models.project_registration_point,
      timestamps: false,
      foreignKey: 'registration_point_id'
    });
  };

  registrationPoint.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    // deprecated attributes that still exist in db
    delete values.category_id;
    delete values.old_model_type;
    delete values.old_model_id;

    return values;
  };

  return registrationPoint;
}
