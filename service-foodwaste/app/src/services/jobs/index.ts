/* istanbul ignore file */

import * as hooks from './hooks';
import Service from './jobs';

export default function () {
  const app = this;

  const service = new Service(app);

  app.use('/jobs', service);

  app.service('/jobs').hooks(hooks);

}
