import Frequency from './frequency';
import Foodwaste from './foodwaste';
import AccountService from './accounts';
import * as accountServiceHooks from './accounts/hooks';
import RegistrationService from './registrations';
import * as registrationServiceHooks from './registrations/hooks';
import SalesService from './sales';
import * as salesServiceHooks from './sales/hooks';

export default function () {
  const app: any = this;

  app.use('/reports/frequency-average-per-day', new Frequency.AveragePerDayService());
  app.service('/reports/frequency-average-per-day').hooks(Frequency.frequencyHooks);

  app.use('/reports/frequency-per-account', new Frequency.PerAccountService());
  app.service('/reports/frequency-per-account').hooks(Frequency.frequencyHooks);

  app.use('/reports/frequency-top-metrics', new Frequency.TopMetricService());
  app.service('/reports/frequency-top-metrics').hooks(Frequency.frequencyHooks);

  app.use('/reports/foodwaste-overview', new Foodwaste.OverviewService());
  app.use('/reports/foodwaste-status', new Foodwaste.StatusService());
  app.use('/reports/foodwaste-top-metrics', new Foodwaste.TopMetricService());
  app.use('/reports/foodwaste-trend', new Foodwaste.TrendService());
  app.use('/reports/foodwaste-per-account', new Foodwaste.PerAccountService());

  app.service('/reports/foodwaste-overview').hooks(Foodwaste.hooks);
  app.service('/reports/foodwaste-status').hooks(Foodwaste.hooks);
  app.service('/reports/foodwaste-top-metrics').hooks(Foodwaste.hooks);
  app.service('/reports/foodwaste-trend').hooks(Foodwaste.hooks);
  app.service('/reports/foodwaste-per-account').hooks(Foodwaste.hooks);

  /*
  Backward compatibility for foodwaste client 3.*.*
  These endpoints are deprecated, the per-guest resource will be queried with resource=per-guest query parameter
  *  */
  app.use('/reports/foodwaste-per-guest-overview', new Foodwaste.OverviewService());
  app.use('/reports/foodwaste-per-guest-status', new Foodwaste.StatusService());
  app.use('/reports/foodwaste-per-guest-top-metrics', new Foodwaste.TopMetricService());
  app.use('/reports/foodwaste-per-guest-trend', new Foodwaste.TrendService());
  app.use('/reports/foodwaste-per-guest-per-account', new Foodwaste.PerAccountService());

  app.service('/reports/foodwaste-per-guest-overview').hooks(Foodwaste.hooks);
  app.service('/reports/foodwaste-per-guest-status').hooks(Foodwaste.hooks);
  app.service('/reports/foodwaste-per-guest-top-metrics').hooks(Foodwaste.hooks);
  app.service('/reports/foodwaste-per-guest-trend').hooks(Foodwaste.hooks);
  app.service('/reports/foodwaste-per-guest-per-account').hooks(Foodwaste.hooks);

  app.use('/reports/accounts', new AccountService());
  app.service('/reports/accounts').hooks(accountServiceHooks);

  app.use('/reports/registrations', new RegistrationService());
  app.service('/reports/registrations').hooks(registrationServiceHooks);

  app.use('/reports/sales', new SalesService());
  app.service('/reports/sales').hooks(salesServiceHooks);
}

