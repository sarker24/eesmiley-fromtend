'use strict';

import { catchAndLogErrors, passHeadersToHooks, setNoCacheHeaders, requestResponseLogger, sanitizeRequest } from 'feathers-middlewares-esmiley';

/*
 * Middleware ran before the services
 */
export function before(): void {
  const app = this;

  app.use(requestResponseLogger(app));
  app.use(setNoCacheHeaders());
  app.use(passHeadersToHooks());
  app.use(sanitizeRequest());
}

/*
 * Middleware ran after the services
 */
export function after(): void {
  // Add your custom middleware here. Remember, that
  // just like Express the order matters, so error
  // handling middleware should go last.
  const app = this;

  app.use(catchAndLogErrors(app));
}
