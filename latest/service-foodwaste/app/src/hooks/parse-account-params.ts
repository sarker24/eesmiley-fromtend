import { Hook, HookContext } from '@feathersjs/feathers';
import { verifyUserAllowedToQueryAccounts } from 'feathers-hooks-esmiley';

/**
 * Super accounts (who are subscribed to multiple sub-accounts, see settings table), are allowed to make queries
 * on sub-accounts' data. This requires query parameter accounts.
 *
 * If the super account hasn't selected any accounts then get queries are executed only on the super account. This is
 * default behaviour so we dont need to do anything for that here (see feathers-hooks-esmiley/populate-user-and-customer hook).
 *
 * Before Hook: FIND
 *
 */

export default (): Hook => {
  return async (hook: HookContext) => {

    if (hook.method !== 'find') {
      return hook;
    }

    const query = hook.params.query;
    const subAccountsParam: string = query['accounts'];

    if (subAccountsParam) {
      // TODO cleaner, quick fix
      await verifyUserAllowedToQueryAccounts()(hook);
      const customerIds: Array<string> = subAccountsParam.toString().split(',');
      delete hook.params.query.accounts;
      hook.params.query.customerId = customerIds;
    }

    return hook;
  };
};
