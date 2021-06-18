import * as hooks from './hooks';

export class Service {
  options: any;

  constructor(options?: any) {
    this.options = options || {};
  }

  /**
   * Return the current Timestamp in seconds, GMT+0200
   * @example 1494251032
   */
  getServerTime() {
    return Math.floor(new Date().getTime() / 1000);
  }

  /**
   * Simply returns the message "pong" and the server time, signifying that the service is up and running.
   *
   * @param params
   * @return {object} Contains the server time at the time of the request
   */
  find(params) {
    return Promise.resolve({ message: 'pong', serverTime: this.getServerTime() });
  }
}

export default function () {
  const app = this;

  app.use('/ping', new Service());

  const pingService = app.service('/ping');

  pingService.hooks(hooks);
}
