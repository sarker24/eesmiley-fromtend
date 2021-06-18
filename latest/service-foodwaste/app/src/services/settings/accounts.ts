import * as errors from '@feathersjs/errors';
import * as commons from 'feathers-commons-esmiley';
import { checkAndSetAccountsHaveSettings } from './util/util';
import Account = SettingsNamespace.Account;

const subModule: string = 'settings-accounts';
let requestId: string;
let sessionId: string;

/**
 * This file provides functionality for the endpoint /projects/:customerId/accounts
 *
 * @param app
 * @returns Object
 */
export default class Accounts {
  app: any;
  sequelize: any;

  constructor(app: any) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }


  public async find(params): Promise<{ subscribed: Account[], notSubscribed: Account[] }> {
    requestId = params.requestId;
    sessionId = params.sessionId;

    try {
      const getSettings: Promise<any> = this.app.service('settings').find({
        query: { customerId: params.query.customerId }
      });
      const getLegacyAccounts: Promise<any> = commons.makeHttpRequest(
        this.app.get('legacyChildDealsEndpoint'),
        { 'Authorization': params.headers.authorization }
      );

      let [legacyResponse, settings] = await Promise.all([getLegacyAccounts, getSettings]);

      if (!settings.accounts || settings.accounts.length === 0) {
        log.info({
          customerId: params.customerId, subModule, requestId, sessionId
        }, 'Customer has no accounts listed in their Settings. Return all accounts from Legacy as "subscribed"');

        return { subscribed: [], notSubscribed: Accounts.parseLegacyAccounts(legacyResponse, params.query.customerId) };
      }

      log.info({
        customerId: params.query.customerId, subModule, requestId, sessionId
      }, 'Customer already has accounts listed in their Settings. Match against the list of accounts from Legacy');

      const { accounts, legacyAccounts, doUpdate } =
        Accounts.divideAccounts(settings.accounts, legacyResponse, params.query.customerId);

      const subscribed: Account[] = await checkAndSetAccountsHaveSettings(accounts, this.sequelize, params);

      if (doUpdate) {
        try {
          log.info({
            accounts: subscribed, requestId, sessionId, subModule, customerId: params.customerId
          }, 'Updating the name of one or more subscribed accounts of the current account...');

          settings.accounts = subscribed;
          const updateObj = {
            customerId: params.customerId,
            settings
          };

          // find or get should be idempotent and safe; they should not have side-effects.
          // instead of adding a second source of truth, we could just get the account data always from
          // the legacy api?
          await this.app.service('settings').create(updateObj, params);
        } catch (err) {
          log.error({
            accounts: subscribed, requestId, sessionId, subModule, customerId: params.customerId
          }, 'Could not update the subscribed accounts with (a) new name(s)');
        }
      }

      return { subscribed, notSubscribed: legacyAccounts };

    } catch (err) {
      if (err.data && err.data.errorCode) {
        throw err;
      }

      throw new errors.GeneralError('Could not retrieve settings for customer', {
        errorCode: 'E187', subModule, errors: err, requestId, sessionId, customerId: params.customerId
      });
    }
  }

  /**
   * Matches the list of accounts retrieved from the customer's FW Settings against the ones retrieved from Legacy and
   * removes from the list of Legacy accounts the ones that also exist in the list of accounts from the Settings.
   *
   * This way at the end we are left only with the "new" accounts, that the customer hasn't subscribed to.
   *
   * @param {Account[]}   accountsFromSettings  The accounts list from the customer's Settings
   * @param {Response[]}  legacyData            The accounts list retrieved from Legacy
   * @param {string}      accountId             The ID of the current user account
   * @return {subscribed, notSubscribed}
   */
  public static divideAccounts(accountsFromSettings: Account[], legacyData: Legacy.Response, accountId: string):
    { accounts: Account[], legacyAccounts: Account[], doUpdate: boolean } {

    const legacyMap = legacyData.children.reduce((all, current) => ({ ...all, [+current.dealId]: current }), {});

    let doUpdate: boolean = false;

    const subscribedAccounts = accountsFromSettings.filter(account => !!legacyMap[account.id]).map(account => {
      const legacyAccount = legacyMap[account.id];
      if (legacyAccount.company !== account.name || legacyAccount.nickname !== account.nickname) {
        doUpdate = true;
        // this here is overhead, just to keep things compatible:
        // if nickname not defined, dont include in response
        const { nickname, ...rest } = account;
        const nextNickname = legacyAccount.nickname ? { nickname: legacyAccount.nickname } : {};
        return { ...rest, name: legacyAccount.company, ...nextNickname };
      } else return account;
    });

    const notSubscribedAccounts = legacyData.children.filter(account => !subscribedAccounts.find(sub => sub.id === parseInt(account.dealId)));

    return {
      accounts: subscribedAccounts,
      legacyAccounts: Accounts.parseLegacyAccounts({ ...legacyData, children: notSubscribedAccounts }, accountId),
      // update if account has been removed or changed
      doUpdate: doUpdate || subscribedAccounts.length !== accountsFromSettings.length
    };
  }

  /**
   * Parses the list of accounts retrieved from Legacy into the format of parameters that we store in the customer's
   * Settings. Namely - instead of "dealdId", we store "id" and instead of "company" we store "name".
   *
   * @param {Response[]} legacyData  The list of accounts retrieved from Legacy
   * @param {string}          accountId The ID of the current user account
   * @return {any[]}
   */
  public static parseLegacyAccounts(legacyData: Legacy.Response, accountId: string): Account[] {
    const result: Account[] = [];

    legacyData.children.map(acc => {
      const id = +acc.dealId;
      /*
       * Sometimes, in the Legacy system, an account might have itself as a subscribed account. If that's the case,
       * omit it, when populating the accounts list in the FW settings
       */
      if (+accountId !== +id) {

        let account: Account = { id, name: acc.company };

        if (acc.nickname != undefined) {
          account.nickname = acc.nickname;
        }

        result.push(account);
      }
    });

    return result;
  }

}
