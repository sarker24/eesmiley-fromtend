import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';
import * as commons from 'feathers-commons-esmiley';

const subModule = 'set-account-name';
let requestId: string;
let sessionId: string;

export default (): Hook => {
  /**
   * Checks whether the account has "name" in their settings. If none provided (at creation time) or existing (when
   * retrieving a record) - get the name for the account from Legacy and set it and update the settings record.
   *
   * Before-hook for: CREATE
   * After-hook for: FIND
   *
   * @param {HookContext} hook    Contains the request object
   * @returns {Promise} Promise   The hook request
   */
  return async (hook: HookContext): Promise<HookContext> => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;
    /*
     * This hook is only meant to be executed for external requests, therefore it will be aborted for internal requests.
     * hook.params.provider === '<something>' means an external request
     */
    if (!hook.params.provider) {
      return hook;
    }

    if (hook.method === 'create') {
      return setNameAtCreateSettings(hook);
    } else if (hook.method === 'find') {
      return setNameAtGetSettings(hook);
    } else {
      return hook;
    }
  };
};

/**
 * Set a name for the account's settings, if not present already, when creating new settings.
 *
 * @param {HookContext} hook
 * @return {Promise<HookContext>}
 */
export async function setNameAtCreateSettings(hook: HookContext): Promise<HookContext> {
  if (hook.data.settings.name && hook.data.settings.name.length > 0) {
    return hook;
  }

  try {
    const legacyData: Legacy.Response = await commons.makeHttpRequest(
      hook.app.get('legacyChildDealsEndpoint'),
      { 'Authorization': hook.params.headers.authorization }
    );
    log.debug({
      legacyData, subModule, requestId, sessionId, customerId: hook.params.query.customerId
    }, 'Pulled data for account from Legacy');

    hook.data.settings.name = legacyData.current.company;

    if (legacyData.current.nickname != undefined) {
      hook.data.settings.nickname = legacyData.current.nickname;
    }

    return hook;

  } catch (err) {
    throw new errors.GeneralError('Could not set a name in the settings of an account when creating settings', {
      errorCode: 'E219', errors: err, customerId: hook.params.query.customerId, subModule, requestId, sessionId
    });
  }
}

/**
 * Set a name for the account's settings, if not present already, when retrieving settings.
 *
 * @param {HookContext} hook
 * @return {Promise<HookContext>}
 */
export async function setNameAtGetSettings(hook: HookContext): Promise<HookContext> {
  if ((hook.result.length === 0) || (hook.result[0].current.name && hook.result[0].current.name.length > 0)) {
    return hook;
  }

  try {
    const legacyData: Legacy.Response = await commons.makeHttpRequest(
      hook.app.get('legacyChildDealsEndpoint'),
      { 'Authorization': hook.params.headers.authorization }
    );
    log.debug({
      legacyData, subModule, requestId, sessionId, customerId: hook.params.query.customerId
    }, 'Pulled data for account from Legacy');

    const name: string = legacyData.current.company;
    const nickname: string|null = legacyData.current.nickname;

    await updateSettings(hook, name, nickname);
    hook.result[0].current.name = name;

    if (nickname != undefined) {
      hook.result[0].current.nickname = nickname;
    }

    return hook;
  } catch (err) {
    if (err.data && err.data.errorCode) {
      throw err;
    }

    throw new errors.GeneralError('Could not set a name in the settings of an account when retrieving settings', {
      errorCode: 'E220', errors: err, customerId: hook.params.query.customerId, subModule, requestId, sessionId
    });
  }
}

/**
 * Simply calls to update the settings object for the particular account.
 * The update happens only for the "name" nested property of the current settings, since this function is called upon
 * GET requests.
 *
 * @param {HookContext} hook
 * @param {string}      name  The new name to be set for the account
 * @param {string|null} nickname  The new nickname to be set for the account
 */
export async function updateSettings(hook: HookContext, name: string, nickname: string|null): Promise<Error | void> {
  const customerId: string = hook.params.query.customerId;
  const settingsRecordId: string = hook.result[0].id;

  try {
    log.info({
      customerId, accountName: name, nickname, subModule, requestId, sessionId
    }, 'Updating the settings of an account with a new name...');

    let patches = [
      {
        op: 'add',
        path: '/current/name',
        value: name
      }
    ];

    if (nickname != undefined) {
      patches.push({
        op: 'add',
        path: '/current/nickname',
        value: nickname
      });
    }


    await hook.app.service('settings').patch(
      settingsRecordId,
      patches
    );
  } catch (err) {
    throw new errors.GeneralError('Could not set a name in the settings of an account', {
      errorCode: 'E218', errors: err, customerId, accountName: name, subModule, requestId, sessionId
    });
  }
}
