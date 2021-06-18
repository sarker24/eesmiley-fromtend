import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'validate-mimetype';
let requestId: string;
let sessionId: string;

export default function (): Hook {
  /**
   * Validates that the mimetype of an uploaded file is supported by us
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

    if (!hook.data.file || !hook.data.file.mimetype) {
      return Promise.reject(new errors.GeneralError('Could not get mimetype for uploaded file', {
        errorCode: 'E142',
        module: hook.app.get('serviceName'),
        subModule,
        data: hook.data,
        requestId,
        sessionId
      }));
    }

    if (!hook.app.get('ingredientUploadAllowedMimeTypes').includes(hook.data.file.mimetype)) {

      return Promise.reject(new errors.GeneralError('Mimetype of provided file is not allowed', {
        errorCode: 'E143',
        module: hook.app.get('serviceName'),
        subModule,
        data: hook.data,
        allowedMimetypes: hook.app.get('ingredientUploadAllowedMimeTypes'),
        requestId,
        sessionId
      }));
    }

    log.debug({
      data: hook.data, subModule, requestId, sessionId
    }, 'Mimetype validation successful');

    return Promise.resolve(hook);
  };
}
