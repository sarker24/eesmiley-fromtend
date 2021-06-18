import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'get-as-rich-object';
let requestId: string;
let sessionId: string;

export default (): Hook => {
  /**
   * Builds a rich object for registrations adding registration point object into the response for POST/PATCH requests
   *
   * After-hook for: ALL
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object
   */
  return (hook: HookContext) => {

    if (!['create', 'patch'].includes(hook.method)) {
      return Promise.resolve(hook);
    }

    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    /*
     * hook.result may be an object or a single array depending of which feathers http method triggered the hook
     * for FIND: hook.result is array
     * for CREATE, GET, PATCH: hook.result is a single object
     *
     * For pragmatic purposes, single objects will be treated as one element arrays, then once validations are done,
     * returned to the user as single objects
     */
    let registrations = [];
    let isResultAnArray = false;
    let registrationsPromises = [];

    if (Array.isArray(hook.result)) {
      registrations = hook.result;
      isResultAnArray = true;
    } else {
      registrations.push(hook.result);
    }

    registrations.forEach((registration) => {
      registrationsPromises.push(getRegistrationAsRichObject(registration, hook.app));
    });

    return Promise.all(registrationsPromises)
      .then((result) => {
        if (isResultAnArray) {
          hook.result = result;
        } else {
          hook.result = result[0];
        }

        return Promise.resolve(hook);
      })
      .catch((err) => {
        if (err.data && err.data.errorCode) {
          return Promise.reject(err);
        }

        return Promise.reject(new errors.GeneralError('Could not build response for Registrations as rich object(s)', {
          errors: err,
          method: hook.method,
          customerId: hook.params.query ? hook.params.query.customerId : undefined,
          errorCode: 'E165',
          subModule,
          requestId,
          sessionId
        }));
      });
  };
};

/**
 * Builds a rich object adding registration point as property for a given registration
 *
 * @param registration
 * @param app
 * @returns {Promise<T>}
 */
export function getRegistrationAsRichObject(registration, app) {
  return app.service('registration-points').get(registration.registrationPointId, {
    query: {
      includeSoftDeleted: true
    }
  })
    .then((registrationPoint) => {
      registration.registrationPoint = registrationPoint;

      return Promise.resolve(registration);
    })
    .catch((err) => {

      return Promise.reject(new errors.GeneralError('Could not build rich object for a registration', {
        errors: err,
        registration,
        errorCode: 'E165',
        subModule,
        requestId,
        sessionId
      }));
    });
}
