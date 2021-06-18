import * as hooks from './hooks';
import Frequency, { RegistrationObj } from './../registrations/frequency';
import moment from 'moment';
import * as queries from '../registrations/util/sql-queries';
import Account = SettingsNamespace.Account;

let momentUTC = moment.utc;

require('moment-weekday-calc');

export class Service {
  app: any;

  constructor(options: { app: any }) {
    this.app = options.app;
  }

  /**
   * Get a object containing the status of the selected accounts, e.g. the registration days per account
   * @param params
   * @returns
   * {
   *    "registrationDaysPerAccount": {
   *        "37286": {
   *            "name": "Dansk FoodWaste Demo ",
   *            "expectedDays": 22,
   *            "registeredDays": 1,
   *            "subscribedAccounts": {
   *                "37313": {
   *                    "name": "Engelsk FoodWaste Demo",
   *                    "expectedDays": 17,
   *                    "registeredDays": 0
   *                }
   *            }
   *        }
   *    }
   * }
   */
  async find(params) {

    const registrationDaysPerAccount = await this.getRegistrationDaysPerAccount(params);

    return {
      registrationDaysPerAccount
    };
  }

  /**
   *
   * @param params
   * @returns object
   */
  async getRegistrationDaysPerAccount(params) {

    const start: string = params.query.start;
    const endInput: string = params.query.end;
    const includeSubscribedAccounts: boolean = params.query.includeSubscribedAccounts;
    const end: string = new Date(endInput) < new Date() ? endInput : momentUTC().format('YYYY-MM-DD');

    let accountIds: string[] = params.query.accounts ? params.query.accounts.toString().split(',') : [];

    const { isAdmin }: { isAdmin: boolean } = params.accessTokenPayload || false;

    if (!isAdmin) {
      if (params.accessTokenPayload && params.accessTokenPayload.customerId) {
        accountIds = [params.accessTokenPayload.customerId];
      } else {
        return [];
      }
    }

    const frequencyObj = this.app.service('/registrations/frequency');

    const accountNames: string[] = [];
    const accountIdsToQuery: string[] = [];
    const settingsPerAccount = {};
    const settings = await this.app.get('sequelize').models.settings.findAll(queries.accountsSettings(accountIds));

    if (settings.length == 0) {
      return [];
    }

    let subscribedAccountsMap = {};

    /*
     * If we include subscribed accounts
     */
    if (includeSubscribedAccounts) {
      for (let accountId of accountIds) {

        const index: number = settings.findIndex(setting => +accountId === +setting.customerId);
        const subscribedAccounts: Account[] = settings[index].current.accounts;
        if (subscribedAccounts != undefined) {
          const subscribedAccountIds: string[] = subscribedAccounts != undefined ?
            subscribedAccounts.map((account: Account) => {
              return account.id.toString();
            }) : [];

          if (subscribedAccountIds.indexOf(accountId) == -1) {
            subscribedAccountIds.push(accountId);
          }

          let subAccountSettings = await this.app.get('sequelize').models.settings.findAll(queries.accountsSettings(subscribedAccountIds));

          for (const setting of subAccountSettings) {

            if (!Frequency.checkAccountHasSettings(setting)) {
              continue;
            }

            const accId = setting.customerId;

            if (+accId === +accountId) {
              accountNames[accId] = setting.current.name;
            } else {
              accountNames[accId] = subscribedAccounts[subscribedAccounts.findIndex(acc => +accId === +acc.id)].name;
            }
            accountIdsToQuery.push(accId);
            settingsPerAccount[accId] = setting.current.expectedFrequency;
            if (accId != accountId) {
              subscribedAccountsMap[accId] = accountId;
            }
          }
        }
      }
    } else {
      /*
       * If we don't include subscribed accounts
       */
      for (const setting of settings) {

        if (!Frequency.checkAccountHasSettings(setting)) {
          continue;
        }

        const accId = setting.customerId;
        accountNames[accId] = setting.current.name;
        accountIdsToQuery.push(accId);
        settingsPerAccount[accId] = setting.current.expectedFrequency;
      }
    }

    if (accountIdsToQuery.length == 0) {
      return [];
    }

    const { regsToHavePerDOW, totalsPerAcc } =
      Frequency.combineRegsFrequencyAndTotalsPerAccount(start, end, accountIdsToQuery, settingsPerAccount);
    const registrations: RegistrationObj[] = await frequencyObj.getDaysWithRegistrations(accountIdsToQuery, start, end);
    /*
     * the `totalsPerAcc` object is passed by value and modified in-scope
     */
    Frequency.calcRegsFrequencyPerAccount(registrations, totalsPerAcc, regsToHavePerDOW);

    let registrationDaysPerAccount = {};

    /*
     * Map the accounts we queried for
     */

    if (includeSubscribedAccounts) {
      for (let accId of accountIds) {
        if (totalsPerAcc[accId] != undefined) {
          registrationDaysPerAccount[accId] = {
            name: accountNames[accId] != undefined ? accountNames[accId] : null, ...totalsPerAcc[accId],
            subscribedAccounts: {}
          };
        }
      }

      /*
       * Add the account names to the rows and map to registrationDaysPerAccount
       */
      for (let accId in totalsPerAcc) {
        if (subscribedAccountsMap[accId] !== undefined && registrationDaysPerAccount[subscribedAccountsMap[accId]] !== undefined) {
          registrationDaysPerAccount[subscribedAccountsMap[accId]].subscribedAccounts[accId] = { name: accountNames[accId] != undefined ? accountNames[accId] : null, ...totalsPerAcc[accId] };
        }
      }
    } else {
      for (let accId of accountIds) {
        if (totalsPerAcc[accId] != undefined) {
          registrationDaysPerAccount[accId] = {
            name: accountNames[accId] != undefined ? accountNames[accId] : null, ...totalsPerAcc[accId]
          };
        }
      }
    }

    return registrationDaysPerAccount;
  }
}

export default function () {
  const app = this;

  app.use('/account-status', new Service({ app }));

  const statusService = app.service('/account-status');

  statusService.hooks(hooks);
}
