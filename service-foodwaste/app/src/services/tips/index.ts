import tipModel from './tip-model';
import * as hooks from './hooks';

const { Service } = require('feathers-sequelize');

export default function () {
  const app: any = this;

  app.use('/tips', new Service({
    Model: tipModel(app.get('sequelize'), app.get('Sequelize'))
  }));

  const tipsService: any = app.service('/tips');

  tipsService.hooks(hooks);
}
