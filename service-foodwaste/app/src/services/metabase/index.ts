/* istanbul ignore file */

import MetabaseRegistrations from './registrations';
import MetabaseProjects from './projects';
import MetabaseSales from './sales';

import * as registrationsHooks from './hooks/registrations-hooks';
import * as projectsHooks from './hooks/projects-hooks';
import * as salesHooks from './hooks/sales-hooks';

export default function () {
  const app: any = this;

  app.use('/metabase/registrations', new MetabaseRegistrations(app));
  app.service('/metabase/registrations').hooks(registrationsHooks);

  app.use('/metabase/projects', new MetabaseProjects(app));
  app.service('/metabase/projects').hooks(projectsHooks);

  app.use('/metabase/sales', new MetabaseSales(app));
  app.service('/metabase/sales').hooks(salesHooks);
}
