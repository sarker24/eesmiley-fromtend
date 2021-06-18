import * as errors from '@feathersjs/errors';
import _ from 'lodash';
import { Hook, HookContext } from '@feathersjs/feathers';
import { checkAndSetAccountsHaveSettings } from '../util/util';
import Account = SettingsNamespace.Account;

const subModule = 'check-subscribed-accounts-have-settings';
let requestId: string;
let sessionId: string;
const HOOK_TYPE_BEFORE = 'before';

export default (): Hook => {
  /**
   * Checks whether the subscribed accounts of a customer have their settings (frequency and weekly waste) set and
   * updates the flag that specifies this for each account in the list
   *
   * Before-hook for: create
   * After-hook for: find
   *
   * @param {HookContext} hook  Contains the request object
   * @returns {Promise} Promise   The hook request
   */
  return (hook: HookContext): Promise<HookContext> => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;
    /*
     * This hook is only meant to be executed for external requests, therefore it will be aborted for internal requests.
     * hook.params.provider === '<something>' means an external request
     */
    if (!hook.params.provider) {
      return Promise.resolve(hook);
    }

    return doCheckAndApplyChanges(hook);
  };
};

/**
 * The point is that when a list of accounts is passed, we want to check whether each of the accounts has their own
 * settings set for 'registrationsFrequency' and 'expectedWeeklyWaste'. We set a flag to True or False accordingly.
 *
 * @param {HookContext} hook
 * @return {Promise<HookContext>}
 */
export async function doCheckAndApplyChanges(hook: HookContext): Promise<HookContext> {
  const hookType: string = hook.type;
  const subscribedAccounts: Array<Account> = hookType === HOOK_TYPE_BEFORE ?
    hook.data.settings.accounts : hook.result.accounts;
  /*
   * If the customer hasn't set a list of subscribed accounts in their settings, or no such list is passed from the
   * client when creating/updating settings, then we do not care about the accounts.
   */
  if (!subscribedAccounts || subscribedAccounts.length === 0) {
    return hook;
  }

  try {
    const accounts: Array<Account> =
      await checkAndSetAccountsHaveSettings(subscribedAccounts, hook.app.get('sequelize'), hook.params);

    if (hookType === HOOK_TYPE_BEFORE) {
      hook.data.settings.accounts = accounts;
    } else {
      /*
       * For when GETing settings, if one/some of the accounts in the list of accounts for the customer have changed
       * their settings for the foodwaste, then we want to update the 'settingsAreSet' flag accordingly.
       * Therefore we compare the original with the "updated" list. If there are differences - then update the
       * list in the database.
       */
      if (!_.isEqual(hook.result.accounts, accounts)) {
        await updateSettings(hook, accounts);
      }
    }

    return hook;

  } catch (err) {
    if (err.data && err.data.errorCode) {
      throw err;
    }
    const customerId = hook.params.query.customerId || hook.params.data.customerId;

    throw new errors.GeneralError('Could not check (or update) whether settings are set for list of accounts', {
      errorCode: 'E186', errors: err, subModule, customerId, requestId, sessionId
    });
  }
}

/**
 * Simply calls to update the settings object for the particular customer.
 * The update happens only for the 'accounts' property of the current settings, since this function is called upon
 * GET requests.
 *
 * @param {HookContext} hook
 * @param {Array<Account>} accounts
 */
export async function updateSettings(hook: HookContext, accounts: Array<Account>): Promise<Error | void> {
  hook.result.accounts = accounts;

  try {
    await hook.app.get('sequelize').models.settings.update(
      {
        current: hook.result
      },
      {
        where: { customerId: hook.params.query.customerId }
      });

    log.info({
      customerId: hook.params.query.customerId, accounts, subModule, requestId, sessionId
    }, 'Updated list of accounts with flag of whether they have settings set');
  } catch (err) {
    throw new errors.GeneralError('Could not update list of accounts with flag of whether they have settings set', {
      errorCode: 'E185',
      errors: err,
      customerId: hook.params.query.customerId,
      accounts,
      subModule,
      requestId,
      sessionId
    });
  }
}
