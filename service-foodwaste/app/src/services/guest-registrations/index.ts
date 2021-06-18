import GuestRegistrationModel from './guest-registration-model';

const { Service } = require('feathers-sequelize');
import * as hooks from './hooks';

export default function () {
  const app: any = this;

  app.use('/guest-registrations', new Service({
    Model: GuestRegistrationModel(app.get('sequelize'), app.get('Sequelize')),
    raw: false
  }));

  app.service('/guest-registrations').hooks(hooks);

}
