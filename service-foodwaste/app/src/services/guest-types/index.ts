import GuestTypeModel from './guest-type-model';

const { Service } = require('feathers-sequelize');
import * as hooks from './hooks';

export default function () {
  const app: any = this;

  app.use('/guest-types', new Service({
    Model: GuestTypeModel(app.get('sequelize'), app.get('Sequelize')),
    raw: false
  }));

  app.service('/guest-types').hooks(hooks);

}
