/* istanbul ignore file */

const { Service } = require('feathers-sequelize');
import settings from './settings-model';
import * as hooks from './hooks';
import Accounts from './accounts';
import * as accountsHooks from './hooks/accounts-hooks';

export default function () {
  const app = this;

  const service = new Service({
    Model: settings(app.get('sequelize'), app.get('Sequelize'))
  });

  app.use('/settings', service);

  const settingsService = app.service('/settings');

  settingsService.hooks(hooks);

  app.use('/settings/:customerId/accounts', new Accounts(app));
  app.service('/settings/:customerId/accounts').hooks(accountsHooks);
}
