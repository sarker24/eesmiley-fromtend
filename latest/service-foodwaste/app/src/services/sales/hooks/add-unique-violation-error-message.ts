import { Hook, HookContext } from '@feathersjs/feathers';

export default function (): Hook {
  /**
   * In case of an error due to unique violation, it changes the error message
   *
   * error-hook for: create
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object with a modified error message
   */
  return function (hook: HookContext) {
    const error: any = hook.error;

    if (error.errors
      && Array.isArray(error.errors)
      && error.errors.length > 0
      && error.errors[0].type === 'unique violation') {

      log.info({
        originalError: error,
        subModule: 'add-unique-violation-error-message',
        requestId: hook.params.requestId,
        sessionId: hook.params.sessionId
      }, 'Changing the error message and code because of Unique Violation');

      error.errorCode = 'E087';
      error.message = error.errors[0].type;
    }

    return Promise.resolve(hook);
  };
}
