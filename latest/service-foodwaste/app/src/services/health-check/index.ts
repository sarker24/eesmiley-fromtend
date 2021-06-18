import * as hooks from './hooks';

export class Service {
  app: any;
  hasRedis: boolean;
  hasPostgres: boolean;

  constructor(options: { app: any }) {
    this.app = options.app;
    this.hasRedis = this.app.get('redis') && /^redis:\/\//.test(this.app.get('redis'));
    this.hasPostgres = this.app.get('postgres') && /^postgres:\/\//.test(this.app.get('postgres'));
  }

  /**
   * Return the current Timestamp in seconds, GMT+0200
   * @example 1494251032
   */
  getServerTime() {
    return Math.floor(new Date().getTime() / 1000);
  }

  /**
   * Tries to query Postgres and Redis.
   *
   * @return {object} An object with the following structure:
   * {
   *  postgres: {bool}, // True if Postgres is up, False otherwise
   *  redis: {bool}, // True if Redis is up, False otherwise
   *  serverTime: {number}, // The timestamp when the request was made
   * }
   */
  find(params) {
    /*
     * Run the checks/promises in parallel.
     * The promises must use .reflect(), otherwise it will stop on the first rejected.
     * We want all the promises to be settled to know each that is failing
     * http://bluebirdjs.com/docs/api/reflect
     */
    const healthCheckPromises = [];
    if (this.hasRedis) {
      /*
       * https://redis.io/commands/ping
       */
      healthCheckPromises.push(this.app.get('redisClient').pingAsync().reflect());
    } else {
      /*
       * String "disabled" is added to healthCheckPromises to ensure result of Promise.all will be the same size
       * no matter what
       */
      healthCheckPromises.push(Promise.resolve('disabled'));
    }

    if (this.hasPostgres) {
      /*
       * http://docs.sequelizejs.com/en/latest/api/sequelize/?highlight=authenticate#authenticate-promise
       */
      healthCheckPromises.push(this.app.get('sequelize').authenticate().reflect());
    } else {
      /*
       * String "disabled" is added to healthCheckPromises to ensure result of Promise.all will be the same size
       * no matter what
       */
      healthCheckPromises.push(Promise.resolve('disabled'));
    }

    return Promise.all(healthCheckPromises).then((result) => {
      const data = {
        redis: this.hasRedis ? result[0].isFulfilled() : result[0],
        postgres: this.hasPostgres ? result[1].isFulfilled() : result[1],
        serverTime: this.getServerTime()
      };

      /*
       * Log each failed check
       */
      const errorCode = 'E030';
      if (data.redis !== true && data.redis !== 'disabled') {
        log.error({
          errorCode,
          err: result[0].reason(),
          module: 'health-check-service',
          requestId: params.requestId,
          sessionId: params.sessionId
        }, 'Could not ping Redis.');
      }
      if (data.postgres !== true && data.postgres !== 'disabled') {
        log.error({
          errorCode,
          err: result[1].reason(),
          module: 'health-check-service',
          requestId: params.requestId,
          sessionId: params.sessionId
        }, 'Could not ping Postgres.');
      }

      /*
       * For the health-check, we always want a normal response object, but not an error one, even if some of the
       * dependencies have failed.
       */
      return Promise.resolve(data);
    });
  }
}

export default function () {
  const app = this;

  app.use('/health-check', new Service({ app }));

  const healthCheckService = app.service('/health-check');

  healthCheckService.hooks(hooks);
}
