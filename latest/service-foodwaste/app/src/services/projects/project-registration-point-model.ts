export default function (sequelize: any, Sequelize: any) {
  sequelize.define('project_registration_point', {
    includeChildren: {
      field: 'include_children',
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
}
