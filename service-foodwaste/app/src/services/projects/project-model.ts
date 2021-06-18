/* istanbul ignore file */

const moment = require('moment');

export default function (sequelize: any, Sequelize: any) {
  const project = sequelize.define('project',
    {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },

      parentProjectId: {
        field: 'parent_project_id',
        type: Sequelize.BIGINT,
        allowNull: true
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      duration: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },

      status: {
        type: Sequelize.ENUM('PENDING_START', 'PENDING_FOLLOWUP', 'RUNNING', 'AWAITING_ACTION', 'FINISHED'),
        allowNull: false,
        defaultValue: 'PENDING_START'
      },

      period: {
        field: 'period',
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },

      actions: {
        field: 'action',
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
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

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

      indexes: [
        {
          name: 'ix_project_duration',
          fields: ['duration'],
          using: 'gin'
        },
        {
          name: 'ix_project_action',
          fields: ['action'],
          using: 'gin'
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

  project.associate = (models) => {
    project.belongsToMany(models.registration, {
      as: 'Registrations',
      through: 'project_registration',
      timestamps: false,
      foreignKey: 'project_id'
    });

    project.belongsToMany(models.registration_point, {
      as: 'registrationPoints',
      through: models.project_registration_point,
      timestamps: false,
      foreignKey: 'project_id'
    });
  };


  return project;
}
