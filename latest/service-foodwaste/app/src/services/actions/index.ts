import actionModel from './action-model';
import * as hooks from './hooks';
const { Service } = require('feathers-sequelize');

export default function () {
  const app: any = this;

  app.use('/actions', new Service({
    Model: actionModel(app.get('sequelize'), app.get('Sequelize'))
  }));

  const actionsService: any = app.service('/actions');

  actionsService.hooks(hooks);
}
