/* istanbul ignore file */

import DashboardService from './dashboard-service';
import * as hooks from './hooks';

export default function () {
  const app: any = this;

  app.use('/dashboard', new DashboardService());
  app.service('/dashboard').hooks(hooks);

}
