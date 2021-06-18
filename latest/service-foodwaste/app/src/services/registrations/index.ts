import registrationModel from './registration-model';
import Waste from './waste';
import Frequency from './frequency';
import Improvements from './improvements';
import * as hooks from './hooks';
import * as wasteHooks from './hooks/waste-hooks';
import * as frequencyHooks from './hooks/frequency-hooks';
import * as improvementsHooks from './hooks/improvements-hooks';

const { Service } = require('feathers-sequelize');

export default function () {
  const app: any = this;

  app.use('/registrations/waste', new Waste(app));
  app.service('/registrations/waste').hooks(wasteHooks);

  app.use('/registrations/frequency', new Frequency(app));
  app.service('/registrations/frequency').hooks(frequencyHooks);

  app.use('/registrations/improvements', new Improvements(app));
  app.service('/registrations/improvements').hooks(improvementsHooks);

  app.use('/registrations', new Service({
    Model: registrationModel(app.get('sequelize'), app.get('Sequelize'))
  }));

  const service: any = app.service('/registrations');

  service.hooks(hooks);
}
