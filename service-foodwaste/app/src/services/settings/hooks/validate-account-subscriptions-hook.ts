import * as errors from '@feathersjs/errors';
import * as commons from 'feathers-commons-esmiley';
import { HookContext } from '@feathersjs/feathers';

const subModule: string = 'validate-account-subscriptions-hook';

/**
 * Before hook: CREATE/PATCH
 *
 * Removes accounts from user's subscriptions, if the user doesnt have access to them.
 */
export default () => {

  return async (hook: HookContext): Promise<HookContext> => {
    const { requestId, sessionId, headers } = hook.params;
    const settingsKey = hook.method === 'create' ? 'settings' : 'current';

    const { app, data: { customerId, [settingsKey]: { accounts } } } = hook;

    if (!accounts || accounts.length === 0) {
      return hook;
    }

    try {
      const legacyResponse = await commons.makeHttpRequest(
        app.get('legacyChildDealsEndpoint'),
        { 'Authorization': headers.authorization }
      ) as Legacy.Response;
      const legacyAccountSet = new Set(legacyResponse.children.map(legacy => parseInt(legacy.dealId)));

      return {
        ...hook,
        data: {
          ...hook.data,
          settings: {
            ...hook.data.settings,
            accounts: accounts.filter(account => legacyAccountSet.has(account.id))
          }
        }
      };

    } catch (error) {
      throw new errors.GeneralError('Could not finish the request, unexpected error occurred', {
        error,
        errorCode: 500,
        customerId,
        requestId,
        sessionId,
        subModule
      });
    }
  };

};
