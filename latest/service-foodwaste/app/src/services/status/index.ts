import * as hooks from './hooks';

export class Service {
  app: any;

  constructor(options: { app: any }) {
    this.app = options.app;
  }

  /**
   * Return the current Timestamp in seconds, GMT+0200
   * @example 1494251032
   */
  getServerTime() {
    return Math.floor(new Date().getTime() / 1000);
  }

  /**
   * Returns a set of useful info reflecting the current status of the service
   *
   * @param params
   * @return {object|Error} Returns the status message on success, Error on failure.
   */
  find(params) {
    return Promise.resolve({
      tag: process.env.BUILD_TAG,
      hash: process.env.BUILD_HASH,
      branch: process.env.BUILD_BRANCH,
      hostname: process.env.HOSTNAME,
      service: this.app.get('serviceName'),
      nodeEnv: process.env.NODE_ENV,
      environment: process.env.ENVIRONMENT,
      migration: process.env.MIGRATION_STATUS,
      logHost: process.env.LOG_SERVER_HOST,
      logPort: process.env.LOG_SERVER_PORT,
      serverTime: this.getServerTime()
    });
  }
}

export default function () {
  const app = this;

  app.use('/status', new Service({ app }));

  const statusService = app.service('/status');

  statusService.hooks(hooks);
}
