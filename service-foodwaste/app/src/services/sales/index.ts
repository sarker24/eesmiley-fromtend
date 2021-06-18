import saleModel from './sale-model';
import * as hooks from './hooks';

const { Service } = require('feathers-sequelize');

export default function () {
  const app: any = this;

  app.use('/sales', new Service({
    Model: saleModel(app.get('sequelize'), app.get('Sequelize'))
  }));

  const salesService: any = app.service('/sales');

  salesService.hooks(hooks);
}
