import TemplateModel from './template-model';

const { Service } = require('feathers-sequelize');
import * as hooks from './hooks';

export default function () {
  const app: any = this;

  app.use('/templates', new Service({
    Model: TemplateModel(app.get('sequelize'), app.get('Sequelize')),
    raw: false
  }));

  app.service('/templates').hooks(hooks);

}
