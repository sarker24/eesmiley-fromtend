import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';
import jsonPatch from 'fast-json-patch';

const subModule: string = 'ingredients-upsert';
let requestId: string;
let sessionId: string;
/**
 *
 * @param options Object containing an 'updateByKeys' array, which will contain the keys that define is an
 * ingredient is unique, F. Ex;
 * options: {
 *   updateByKeys: ['customerId', 'name']
 * }
 * @returns {(hook:any)=>any}
 */
export default function (options): Hook {
  /**
   * Does validation before creating, if ingredient exist already overrides it, if not, creates a new one
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

    if (options && options.updateByKeys && options.updateByKeys.length > 0) {
      const query = {};

      for (const updateByKey of options.updateByKeys) {
        query[updateByKey] = hook.data[updateByKey];
      }

      return hook.app.service('ingredients').find({ query })
        .then((result) => {

          log.debug({
            result, subModule, requestId, sessionId
          }, `Result filtering ingredients by ${options.updateByKeys}`);

          if (result.length === 0) {
            log.debug({
              subModule, requestId, sessionId
            }, 'New ingredient. Proceeding with normal creation');

            return hook;
          }

          log.debug({
            subModule, requestId, sessionId
          }, 'Existing ingredient. Proceeding with update');

          const ingredient = result[0];
          hook.data.id = ingredient.id;

          /*
           * Patch operations array is builded through jsonPatch.compare
           */
          const ops = jsonPatch.compare(ingredient, hook.data);

          return hook.app.service('ingredients').patch(ingredient.id, ops);
        })
        .then((result) => {
          /*
           * If result is a hook object, means a create action should be performed
           * else an Update action was already performed
           */
          if (!result.method) {
            log.debug({
              subModule, requestId, sessionId
            }, 'Existing ingredient updated');

            hook.result = result;
          }

          log.debug({
            subModule, requestId, sessionId
          }, 'New ingredient. No update performed. Exiting hook...');

          return Promise.resolve(hook);
        })
        .catch((err) => {
          return Promise.reject(new errors.GeneralError('Could not perform upsert for ingredients',
            { errorCode: 'E103', errors: err, subModule, requestId, sessionId }));
        });
    } else {
      return Promise.reject(new errors.GeneralError('Fields for upsert not defined',
        { errorCode: 'E104', subModule, requestId, sessionId }));
    }
  };
}
