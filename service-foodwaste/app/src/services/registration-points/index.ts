import registrationPointModel from './registration-point-model';

import * as hooks from './hooks';
import * as registrationPointTreeHooks from './hooks/registration-point-trees-hooks';

const { Service } = require('feathers-sequelize');

export default function () {
  const app: any = this;

  app.use('/registration-points', new Service({
    Model: registrationPointModel(app.get('sequelize'), app.get('Sequelize')),
    raw: false
  }));

  const registrationPointService: any = app.service('/registration-points');

  registrationPointService.hooks(hooks);

  app.use('/registration-point-trees', new Service({
    Model: registrationPointModel(app.get('sequelize'), app.get('Sequelize')),
    raw: false
  }));

  app.service('/registration-point-trees').hooks(registrationPointTreeHooks);
}
