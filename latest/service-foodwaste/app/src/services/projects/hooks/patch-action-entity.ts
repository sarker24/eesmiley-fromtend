import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'patch-action-entity-for-project';
let requestId: string;
let sessionId: string;

export default (): Hook => {
  /**
   * Creates or updates Action entity records, depending on the given action object values in the patch operations.
   * If the action object contains `id` property, this means the corresponding action exists in the DB and will be patched.
   * Otherwise, it will be created as a new Action entity record.
   *
   * NOTE: if none of the operations is regarding `actions`, then exit this hook before any logic is applied.
   *
   * Before-hook for: patch
   *
   * @param {any} hook  The hook object with the Project data
   * @returns {Promise} Promise   The hook object with updated `actions` data for the Project
   */
  return (hook: HookContext & { operations: any[]; }) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    let isActionsPatch = false;

    hook.operations.forEach((op) => {
      if (op.path.indexOf('actions') > 0) {
        isActionsPatch = true;
      }
    });

    if (!isActionsPatch) {
      return Promise.resolve(hook);
    }

    /*
     * `actions` object of the project should be an array. If it is not, just return and the schemaValidation hook
     * will handle it as an error
     */
    if (!Array.isArray(hook.data.actions)) {
      return Promise.resolve(hook);
    }

    log.debug({
      subModule, actions: hook.data.actions, projectId: hook.data.id, requestId, sessionId
    }, 'Perform patch operations for actions of a project');

    const promises = [];
    hook.data.actions.forEach((action, index) => {
      if (action.id) {
        promises.push(patchActionEntity(action, hook, index));
      } else {
        promises.push(addActionEntity(action, hook, index));
      }
    });

    return Promise.all(promises)
      .then((result) => {
        return Promise.resolve(result[result.length - 1]);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };
};

/**
 * Create an new action record in the Action entity.
 *
 * The result (an "action" object with an ID and all) replaces the current "action" object in the `actions` list for the
 * project. This way the `actions` jsonb column in the Project entity will be patched with correct "action" object as well.
 *
 * @param {object}  action      The action object coming from the client. It does NOT contain an `id`, but only `name`
 * (and maybe also `description`) which means it has to be created as new Action entity record.
 * @param {object}  hook        The hook object
 * @param {number}  actionIndex The index of the current action in the list of actions for the project
 * @return {Promise<object>}    Returns the hook with an updated `actions` object for the project
 */
export function addActionEntity(action, hook, actionIndex) {
  action.customerId = hook.data.customerId;
  action.userId = hook.data.userId;

  log.info({
    subModule, action, projectId: hook.data.id, requestId, sessionId
  }, 'Creating an action for a project.');

  return hook.app.service('actions').create(action)
    .then((action) => {
      hook.data.actions[actionIndex] = action;

      return Promise.resolve(hook);
    })
    .catch((err) => {
      return Promise.reject(new errors.GeneralError('Could not create new action for project.', {
        subModule, action, projectId: hook.data.id, errors: err, requestId, sessionId
      }));
    });
}

/**
 * Patch an existing record in the Action entity.
 *
 * The result (an updated "action" object) replaces the current "action" object in the `actions` list for the project.
 * This way the `actions` jsonb column in the Project entity will be patched with correct "action" object as well.
 *
 * If for some reason we try to patch a non-existing Action - create it instead.
 *
 * @param {object}  action      The action object coming from the client. It does contain an `id`, therefore is an
 * existing Action entity record and we want to update only its `name` and/or `description` (thus omitting `id` when
 * constructing the `operations` object)
 * @param {object}  hook        The hook object
 * @param {number}  actionIndex The index of the current action in the list of actions for the project
 * @return {Promise<object>}    Returns the hook with an updated `actions` object for the project
 */
export function patchActionEntity(action, hook, actionIndex) {
  const operations = [];

  Object.keys(action).forEach((property) => {
    if (property === 'name' || property === 'description') {
      operations.push({
        op: 'replace',
        path: `/${property}`,
        value: action[property]
      });
    }
  });

  log.info({
    subModule, action, operations, projectId: hook.data.id, requestId, sessionId
  }, 'Patching an action for a project.');

  return hook.app.service('actions').patch(parseInt(action.id), operations)
    .then((action) => {
      hook.data.actions[actionIndex] = action;

      return Promise.resolve(hook);
    })
    .catch((err) => {
      if (err.name === 'NotFound') {
        log.debug({
          subModule, action, operations, projectId: hook.data.id, requestId, sessionId
        }, 'Action to be patched was passed with "id" but does not actually exist in entity table. Creating it now...');
        /*
         * Delete the given ID because we want the DB to set the ID of the new record.
         */
        delete action.id;

        return addActionEntity(action, hook, actionIndex);
      }

      return Promise.reject(new errors.GeneralError('Could not patch action for project.', {
        subModule, action, operations, projectId: hook.data.id, errors: err, requestId, sessionId
      }));
    });
}

