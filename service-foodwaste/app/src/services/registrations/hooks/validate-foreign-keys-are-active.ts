import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'validate-foreign-keys-are-active';
let requestId: string;
let sessionId: string;

export default function (): Hook {
  /**
   * validate that the Foreign keys for a registration are active
   *
   *
   * Before-hook for: create
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object
   */
  return function (hook: HookContext) {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    return hook.app.service('registration-points').find({
      query: {
        id: hook.data.registrationPointId,
        active: true,
        customerId: hook.data.customerId
      }
    })
      .then((registrationPoint) => {
        if (!registrationPoint || registrationPoint.length === 0) {
          throw new errors.BadRequest('registrationPoint for a registration is not active or does not exist', {
            errorCode: 'E133',
            subModule,
            registration: hook.data,
            requestId,
            sessionId
          });
        }

        log.debug({
          registration: hook.data, subModule, requestId, sessionId
        }, 'registrationPoint is valid, continue to validating registration point');

        return Promise.resolve(hook);
      })
      .catch((err) => {

        return Promise.reject(err);
      });
  };
}
