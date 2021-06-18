import Moment from 'moment';
import * as errors from '@feathersjs/errors';
import { getPeriodLabelFormatter } from './util/util';
import Account = SettingsNamespace.Account;
import Settings = SettingsNamespace.Settings;

const moment = Moment.utc;
const subModule: string = 'registrations-waste';
let requestId: string;
let sessionId: string;

export interface IWaste {
  actualCost: number | string;
  actualAmount: number | string;
  accountsWithoutSettings: number[] | string[];
  expectedAmount: number | string;
  forecastedAmount?: number | string;
  registrationPoints?: IWastePerItem[];
  accounts?: IWastePerAccount[];
}

export interface IWastePerAccount {
  actualCost: number | string;
  actualAmount: number | string;
  accountId: string;
  name: string;
  expectedAmount: number | string;
  forecastedAmount?: number | string;
  registrationPoints?: IWastePerItem[];
}

export interface IWastePerItem {
  cost: number | string;
  amount: number | string;
  name: string;
  accountId?: string;
  registrationPointId?: string;
  path?: string;
  parentId?: number;
}

export interface IExpectedAmount {
  totalExpectedAmount: number | string;
  expectedAmountsPerAccount: any[];
  accountsWithoutSettings: string[] | number[];
  accountsWithSettings: string[] | number[];
}

export default class Waste {
  app: any;
  sequelize: any;
  private static periodFormatter: any;

  constructor(app: any) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  /**
   * Returns an object with information about the amount wasted for a given period of time, giving along
   * specific results per account and per registration point.
   *
   * @param params
   * @returns {Promise<IWaste>}
   */
  public async find(params): Promise<IWaste> {
    requestId = params.requestId;
    sessionId = params.sessionId;
    const start: string = params.query.start;
    const end: string = params.query.end;
    let accountIds: string[] = params.query.accounts ? params.query.accounts.toString().split(',') : [];
    let period: Moment.unitOfTime.DurationConstructor = params.query.period || null;

    if (accountIds.length === 0) {
      /*
       * If the customer hasn't selected any accounts (none given in the req input) then get data only for the
       * customer itself
       */

      accountIds.push(params.query.customerId.toString());
    }

    return this.buildResponse(params.query.customerId.toString(), accountIds, start, end, period);
  }

  /**
   * Builds response by calling the different methods of each of the sections in the response
   * totals,
   * totals per registration point,
   * totals per account,
   * totals per account per registration point,
   * accounts with no settings
   *
   * @param {string} accountQuerying
   * @param {string[] | number[]} accountIds
   * @param {string} start
   * @param {string} end
   * @param {Moment.unitOfTime.DurationConstructor} period
   * @returns {Promise<IWaste>}
   */
  public async buildResponse(
    accountQuerying: string, accountIds: string[] | number[], start: string, end: string, period: Moment.unitOfTime.DurationConstructor): Promise<IWaste> {
    let accountsWithoutSettings;
    let accountsWithSettings;
    let totalActualAmount;
    let totalActualAmountPerRegistrationPoint;
    let actualAmountPerAccount;
    let actualAmountPerAccountPerRegistrationPoint;
    let expectedAmounts;
    let trends;
    let accountsDetails;

    try {
      accountsDetails = await this.validateAccountsAccessAndGetDetails(accountQuerying, accountIds);
      expectedAmounts = await this.getExpectedAmounts(accountIds, start, end);
      /*
       * FOr readability down in the code, let's extract accountsWithSettings and accountsWithoutSettings
       * to separated variables
       */
      accountsWithSettings = Object.assign([], expectedAmounts.accountsWithSettings);
      accountsWithoutSettings = Object.assign([], expectedAmounts.accountsWithoutSettings);
      /*
       * Since we stored accountsWithSettings and accountsWithoutSettings in different variables, we don't need
       * them anymore in the expectedAmounts object
       */
      delete expectedAmounts.accountsWithSettings;
      delete expectedAmounts.accountsWithoutSettings;
      totalActualAmount = await this.getTotalActualAmount(accountsWithSettings, start, end);
      totalActualAmountPerRegistrationPoint = await this.getTotalAmountPerRegistrationPoint(accountsWithSettings, start, end);
      actualAmountPerAccount = await this.getActualAmountPerAccount(accountsWithSettings, start, end);
      Waste.calculateForecastedAmount(actualAmountPerAccount, totalActualAmount, start, end);
      actualAmountPerAccountPerRegistrationPoint = await this.getAmountPerAccountPerRegistrationPoint(accountsWithSettings, start, end);

      if (period) {
        Waste.periodFormatter = getPeriodLabelFormatter(period);

        trends = await this.buildTrends(accountIds, start, end, period);
      }
    } catch (err) {
      if (err.data && err.data.errorCode) {
        throw err;
      }

      throw new errors.GeneralError('Could not retrieve data to build waste report', {
        account: accountQuerying, accountIds, errors: err, errorCode: 'E199', subModule, requestId, sessionId
      });
    }

    let result = totalActualAmount;
    /*
     * We build the totals
     */
    result.accountsWithoutSettings = accountsWithoutSettings;
    result.expectedAmount = expectedAmounts.totalExpectedAmount;
    result.accounts = actualAmountPerAccount;
    result.registrationPoints = totalActualAmountPerRegistrationPoint;

    for (let account of result.accounts) {
      /*
       * We add the name of each account to the object we are building
       * pareInt and toString together to force them to be the same type and avoid typescript errors
       */
      account.name = accountsDetails.find(detail => +detail.id === +account.accountId).name;

      /*
       * We build the totals per account
       */
      account.expectedAmount = expectedAmounts.expectedAmountsPerAccount.find(acc => {
        return +account.accountId === +acc.accountId;
      }).expectedAmount;

      account.registrationPoints = actualAmountPerAccountPerRegistrationPoint.filter((acc) => {
        return +account.accountId === +acc.accountId;
      });

      if (trends && trends[account.accountId]) {
        account.trend = trends[account.accountId];
      }
    }

    return result;
  }

  /**
   * Builds a trend with the totals per account for the file previous periods based on the "period" query param
   * periods refers to the last five weeks, months or years.
   *
   * @param {string[] | number[]} accountIds
   * @param {string} start
   * @param {string} end
   * @param {Moment.unitOfTime.DurationConstructor} period
   * @returns {Promise<{}>}
   */
  public async buildTrends(accountIds: Array<number | string>, start: string, end: string, period: Moment.unitOfTime.DurationConstructor) {
    const expectedAmountsPromises = [];
    const actualAmountsPromise = [];
    for (let i = 1; i <= 5; i++) {
      const pastStart = moment(start).subtract(i, period).format('YYYY-MM-DD');
      const pastEnd = moment(end).subtract(i, period).format('YYYY-MM-DD');

      expectedAmountsPromises.push(this.getExpectedAmounts(accountIds, pastStart, pastEnd));
      actualAmountsPromise.push(this.getActualAmountPerAccount(accountIds, pastStart, pastEnd));
    }
    let expectedAmounts;
    let actualAmounts;
    try {
      expectedAmounts = await Promise.all(expectedAmountsPromises);
      actualAmounts = await Promise.all(actualAmountsPromise);
    } catch (err) {
      throw new errors.GeneralError('Could not get the actual amount and expected amount to build the trend', {
        accountIds, errors: err, errorCode: 'E215', subModule, requestId, sessionId
      });
    }

    const trend = {};
    accountIds.forEach((accountId) => trend[accountId] = []);

    for (let i = 0; i < 5; i++) {
      const periodStart = moment(start).subtract(i + 1, period).format('YYYY-MM-DD');

      accountIds.forEach((accountId: string) => {
        const trendItem = {
          periodLabel: Waste.periodFormatter(periodStart),
          actualCost: '0',
          actualAmount: '0',
          expectedAmount: '0'
        };
        /*
         * Getting actual amount and actual cost
         */
        if (actualAmounts[i].length > 0) {
          const account = actualAmounts[i].find((account) => parseInt(account.accountId) === parseInt(accountId));
          if (account) {
            trendItem.actualCost = account.actualCost;
            trendItem.actualAmount = account.actualAmount;
          }
        }
        /*
         * Getting expected amount
         */
        if (expectedAmounts[i]) {
          const account = expectedAmounts[i].expectedAmountsPerAccount.find(
            (account) => parseInt(account.accountId) === parseInt(accountId));
          if (account) {
            trendItem.expectedAmount = account.expectedAmount;
          }
        }
        trend[accountId].push(trendItem);
      });
    }

    return trend;
  }

  /**
   * Gets the actual amount per account. Returns an array with the total food wasted grouped by account
   *
   * @param {Array<number | string>} accountIds
   * @param {string} start
   * @param {string} end
   * @returns {Promise<IWastePerAccount[]>}
   */
  public async getActualAmountPerAccount(accountIds: Array<number | string>, start: string, end: string): Promise<IWastePerAccount[]> {
    const sequelizeQuery: Object = {
      attributes: [
        [this.sequelize.col('registration.customer_id'), 'accountId'],
        [this.sequelize.fn('sum', this.sequelize.col('registration.cost')), 'actualCost'],
        [this.sequelize.fn('sum', this.sequelize.col('registration.amount')), 'actualAmount']
      ],
      raw: true,
      include: [
        {
          model: this.sequelize.models.registration_point,
          as: 'registrationPoint',
          required: true,
          attributes: []
        }
      ],
      where: {
        customerId: {
          $in: accountIds
        },
        date: {
          $gte: start,
          $lte: end
        }
      },
      group: ['accountId'],
      timestamps: false
    };

    try {
      const queryResult = await this.app.get('sequelize').models.registration.findAll(sequelizeQuery);
      const result = [];

      for (const accountId of accountIds) {
        const resultForAccountId = queryResult.find((queryResultItem) => queryResultItem.accountId === accountId);
        if (resultForAccountId) {
          result.push(resultForAccountId);
        } else {
          result.push({
            accountId,
            actualCost: '0',
            actualAmount: '0'
          });
        }
      }

      return result;

    } catch (err) {
      throw new errors.GeneralError('Could not calculate the actual amount of waste per account', {
        accountIds, errors: err, errorCode: 'E200', subModule, requestId, sessionId
      });
    }
  }

  /**
   * Gets the total food wasted grouped by account and by registration point
   *
   * @param {Array<number | string>} accountIds
   * @param {string} start
   * @param {string} end
   * @returns {Promise<IWastePerItem[]>}
   */
  public async getAmountPerAccountPerRegistrationPoint(accountIds: Array<number | string>, start: string, end: string): Promise<IWastePerItem[]> {
    const sequelizeQuery: Object = {
      attributes: [
        'registrationPointId',
        [this.sequelize.col('registrationPoint.name'), 'name'],
        [this.sequelize.col('registrationPoint.path'), 'path'],
        [this.sequelize.col('registrationPoint.parent_id'), 'parentId'],
        [this.sequelize.fn('sum', this.sequelize.col('registration.cost')), 'cost'],
        [this.sequelize.fn('sum', this.sequelize.col('registration.amount')), 'amount'],
        [this.sequelize.col('registration.customer_id'), 'accountId']
      ],
      raw: true,
      include: [
        {
          model: this.sequelize.models.registration_point,
          as: 'registrationPoint',
          required: true,
          attributes: []
        }
      ],
      where: {
        customerId: {
          $in: accountIds
        },
        date: {
          $gte: start,
          $lte: end
        }
      },
      group: ['accountId', 'registrationPointId', 'name', 'path', 'parentId'],
      timestamps: false
    };

    try {
      return await this.app.get('sequelize').models.registration.findAll(sequelizeQuery);

    } catch (err) {
      throw new errors.GeneralError('Could not calculate the amount of waste per account per registration point', {
        accountIds, errors: err, errorCode: 'E201', subModule, requestId, sessionId
      });
    }
  }

  /**
   * Gets the total amount of food wasted
   *
   * @param {Array<number | string>} accountIds
   * @param {string} start
   * @param {string} end
   * @returns {Promise<IWaste>}
   */
  public async getTotalActualAmount(accountIds: Array<number | string>, start: string, end: string): Promise<IWaste> {
    const sequelizeQuery: Object = {
      attributes: [
        [this.sequelize.fn('sum', this.sequelize.col('registration.cost')), 'actualCost'],
        [this.sequelize.fn('sum', this.sequelize.col('registration.amount')), 'actualAmount']
      ],
      raw: true,
      include: [
        {
          model: this.sequelize.models.registration_point,
          as: 'registrationPoint',
          required: true,
          attributes: []
        }
      ],
      where: {
        customerId: {
          $in: accountIds
        },
        date: {
          $gte: start,
          $lte: end
        }
      },
      timestamps: false
    };

    try {
      const result = await this.app.get('sequelize').models.registration.findAll(sequelizeQuery);

      /*
       * We sanitize the result to display 0 instead of null for those amounts which can't be calculated due to
       * lack of data
       */
      for (const key in result[0]) {
        if (result[0][key] === null) {
          result[0][key] = '0';
        }
      }

      return result[0];

    } catch (err) {
      throw new errors.GeneralError('Could not calculate the total amount of waste', {
        accountIds, errors: err, errorCode: 'E202', subModule, requestId, sessionId
      });
    }
  }

  /**
   * Gets the total amount of food wasted grouped by registration point
   *
   * @param {Array<number | string>} accountIds
   * @param {string} start
   * @param {string} end
   * @returns {Promise<IWastePerItem[]>}
   */

  public async getTotalAmountPerRegistrationPoint(accountIds: Array<number | string>, start: string, end: string): Promise<IWastePerItem[]> {
    const sequelizeQuery: Object = {
      attributes: [
        [this.sequelize.fn('sum', this.sequelize.col('registration.cost')), 'cost'],
        [this.sequelize.fn('sum', this.sequelize.col('registration.amount')), 'amount'],
        [this.sequelize.fn('lower', this.sequelize.col('registrationPoint.name')), 'name']
      ],
      raw: true,
      include: [
        {
          model: this.sequelize.models.registration_point,
          as: 'registrationPoint',
          required: true,
          attributes: []
        }
      ],
      where: {
        customerId: {
          $in: accountIds
        },
        date: {
          $gte: start,
          $lte: end
        }
      },
      group: ['name'],
      timestamps: false
    };

    try {
      const result = await this.app.get('sequelize').models.registration.findAll(sequelizeQuery);

      return result.map(registrationPoint => {
        registrationPoint.name = registrationPoint.name.charAt(0).toUpperCase() + registrationPoint.name.slice(1).toLowerCase();
        return registrationPoint;
      });

    } catch (err) {
      throw new errors.GeneralError('Could not calculate total amount per registration point', {
        accountIds, errors: err, errorCode: 'E203', requestId, sessionId, subModule
      });
    }
  }

  /**
   * Gets the expected amounts for each account, if an account has no expectedWeeklyWaste settings, it adds it
   * to a separated array, which will be return along with the result
   *
   * Expected amounts are calculated based on the dates defined in the expectedWeeklyWaste
   *
   * Structure expected from expectedWeeklyWaste
   * {
   *   '0': <Value>,
   *   '<date in format YYYY-MM-DD>': <value>
   * }
   *
   * @param {Array<number | string>} accountIds
   * @param {string} start
   * @param {string} end
   * @returns {Promise<IExpectedAmount>}
   */
  public async getExpectedAmounts(accountIds: Array<number | string>, start: string, end: string): Promise<IExpectedAmount> {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    let settings: Settings[];

    try {
      settings = await this.app.get('sequelize').models.settings.findAll({
        attributes: ['customerId', 'current'],
        where: {
          customerId: {
            $in: accountIds
          }
        },
        raw: true,
        timestamps: false
      });
    } catch (err) {
      throw new errors.GeneralError('Could not fetch expected weekly amount', {
        accountIds, errors: err, errorCode: 'E204', subModule, requestId, sessionId
      });
    }

    let totalExpectedAmount = 0;
    let expectedAmountsPerAccount = [];
    /*
     * To find out which accounts have no settings, we add all of them to an array, and start removing them
     * as soon as we find they have settings, elements still in the array by the end of the valitions of this method
     * will be the ones with no settings
     */
    let accountsWithoutSettings = Object.assign([], accountIds);
    let accountsWithSettings = [];
    for (const accountSetting of settings) {
      if (accountSetting.current && accountSetting.current.expectedWeeklyWaste) {
        const index = accountsWithoutSettings.findIndex((accountId) => parseInt(accountId) === parseInt(accountSetting.customerId));
        accountsWithoutSettings.splice(index, 1);
        accountsWithSettings.push(accountSetting.customerId);

        let valueExpectedAmountAccount = 0;
        const expectedWeeklyWasteKeys: Date[] = Object.keys(accountSetting.current.expectedWeeklyWaste)
          .map((weeklyWasteAsString) => new Date(weeklyWasteAsString))
          .sort((a, b) => moment(a).unix() - moment(b).unix());

        for (let [index, expectedWeeklyWasteKeysItemAux] of expectedWeeklyWasteKeys.entries()) {
          /*
           * Settings doesn't apply to the period at all
           */
          if (expectedWeeklyWasteKeysItemAux > endDateObj) {
            break;
          }

          let expectedWeeklyWasteKeysItem: Date | number;
          if (expectedWeeklyWasteKeysItemAux.getTime() === (new Date('0')).getTime()) {
            expectedWeeklyWasteKeysItem = 0;
          } else {
            expectedWeeklyWasteKeysItem = expectedWeeklyWasteKeysItemAux;
          }
          /*
           * Settings apply for the whole period
           */
          if (expectedWeeklyWasteKeysItem < startDateObj
            && (!expectedWeeklyWasteKeys[index + 1]
              || expectedWeeklyWasteKeys[index + 1] > endDateObj)) {

            log.debug({
              accountIds, subModule, settings: accountSetting.current.expectedWeeklyWaste
            }, 'Settings apply for the whole period');

            const daysInPeriod: number =
              moment(end, 'YYYY-MM-DD').diff(moment(start, 'YYYY-MM-DD'), 'days') + 1;
            const date: string = expectedWeeklyWasteKeysItem === 0 ?
              '0' : moment(expectedWeeklyWasteKeysItem).format('YYYY-MM-DD');
            const currentExpectedWaste: number =
              accountSetting.current.expectedWeeklyWaste[date];

            valueExpectedAmountAccount = Math.round(currentExpectedWaste * daysInPeriod / 7);

            break;
          }
          /*
           * Settings apply from the start date and apply until a point before the end date
           */
          if (expectedWeeklyWasteKeysItem <= startDateObj
            && expectedWeeklyWasteKeys[index + 1] >= startDateObj
            && expectedWeeklyWasteKeys[index + 1] < endDateObj) {

            log.debug({
              accountIds, subModule, settings: accountSetting.current.expectedWeeklyWaste
            }, 'Settings apply from the start date and apply until a point before the end date');

            const daysInPeriod: number =
              moment(expectedWeeklyWasteKeys[index + 1]).diff(moment(start, 'YYYY-MM-DD'), 'days') + 1;
            const date: string = expectedWeeklyWasteKeysItem === 0 ?
              '0' : moment(expectedWeeklyWasteKeysItem).format('YYYY-MM-DD');
            const currentExpectedWaste: number =
              accountSetting.current.expectedWeeklyWaste[date];

            valueExpectedAmountAccount += Math.round(currentExpectedWaste * daysInPeriod / 7);

          } else if (expectedWeeklyWasteKeysItem >= startDateObj
            && expectedWeeklyWasteKeys[index + 1] < endDateObj) {
            /*
             * Settings apply from a point after the start date and apply until a point before the end date
             */
            log.debug({
              accountIds, subModule, settings: accountSetting.current.expectedWeeklyWaste
            }, 'Settings apply from a point after the start date and apply until a point before the end date');

            const daysInPeriod: number =
              moment(expectedWeeklyWasteKeys[index + 1]).diff(moment(expectedWeeklyWasteKeysItem), 'days') + 1;
            const date: string = expectedWeeklyWasteKeysItem === 0 ?
              '0' : moment(expectedWeeklyWasteKeysItem).format('YYYY-MM-DD');
            const currentExpectedWaste: number =
              accountSetting.current.expectedWeeklyWaste[date];

            valueExpectedAmountAccount += Math.round(currentExpectedWaste * daysInPeriod / 7);

          } else if (expectedWeeklyWasteKeysItem >= startDateObj
            && (!expectedWeeklyWasteKeys[index + 1]
              || expectedWeeklyWasteKeys[index + 1] > endDateObj)) {
            /*
             * Settings apply from a point after the start date and apply until the end date
             */
            log.debug({
              accountIds, subModule, settings: accountSetting.current.expectedWeeklyWaste
            }, 'Settings apply from a point after the start date and apply until the end date');

            const daysInPeriod: number =
              moment(end, 'YYYY-MM-DD').diff(moment(expectedWeeklyWasteKeysItem), 'days') + 1;
            const date: string = expectedWeeklyWasteKeysItem === 0 ?
              '0' : moment(expectedWeeklyWasteKeysItem).format('YYYY-MM-DD');
            const currentExpectedWaste: number =
              accountSetting.current.expectedWeeklyWaste[date];

            valueExpectedAmountAccount += Math.round(currentExpectedWaste * daysInPeriod / 7);
          }
        }
        expectedAmountsPerAccount.push({
          accountId: accountSetting.customerId,
          expectedAmount: valueExpectedAmountAccount.toString()
        });
        totalExpectedAmount += valueExpectedAmountAccount;
      }
    }

    return {
      totalExpectedAmount: totalExpectedAmount.toString(),
      expectedAmountsPerAccount,
      accountsWithoutSettings,
      accountsWithSettings
    };
  }

  /**
   * Validates that the account doing the request can indeed access the data of the accounts passed as query param.
   * In case afirmative, details of the queried accounts will be returned alogn
   *
   * @param {string} accountIdQuerying
   * @param {Array<number | string>} accountIds
   * @returns {Promise<Account[]>}
   */
  public async validateAccountsAccessAndGetDetails(accountIdQuerying: string, accountIds: Array<number | string>): Promise<Account[]> {
    /*
     * TO find out which accounts are not associated, we add them all to an array, and start removing them from it
     * once we find that they are indeed subscribed to.
     */
    const accountsNotAssociated = Object.assign([], accountIds);
    let settings;
    try {
      settings = await this.app.get('sequelize').models.settings.findAll({
        attributes: ['customerId', 'current'],
        where: {
          customerId: accountIdQuerying
        },
        raw: true,
        timestamps: false
      });
    } catch (err) {
      throw new errors.GeneralError('Could not fetch settings to get details of the subscribed accounts', {
        accountId: accountIdQuerying, accountIds, errors: err, errorCode: 'E205', requestId, sessionId
      });
    }

    for (const associatedAccounts of settings[0].current.accounts) {
      const index = accountsNotAssociated.findIndex((accountId) => parseInt(accountId) === parseInt(associatedAccounts.id));
      if (index >= 0) {
        accountsNotAssociated.splice(index, 1);
      }
    }

    /*
     * If the current account (The one described in the access Token), is also part of the accounts in the URL get params
     * used to query, we will admit it (Since the accounts have access to query themselves
     */
    if (accountIds.includes(accountIdQuerying) || accountIds.includes(parseInt(accountIdQuerying))) {
      const index = accountsNotAssociated.findIndex((accountId) => parseInt(accountId) === parseInt(accountIdQuerying));
      if (index >= 0) {
        accountsNotAssociated.splice(index, 1);
      }
      /*
       * If the current account (The one described in the access Token), is not part of the subscribed accounts
       * we add it to it
       */
      if (settings[0].current.accounts.findIndex(
        (associatedAccount) => parseInt(associatedAccount.id) === parseInt(accountIdQuerying)) < 0) {
        settings[0].current.accounts.push({
          id: parseInt(accountIdQuerying),
          name: settings[0].current.name
        });
      }
    }

    if (accountsNotAssociated.length > 0) {
      throw new errors.BadRequest('Account is not allowed to query for the provided account ids', {
        accountId: accountIdQuerying, accountIds, errorCode: 'E206', requestId, sessionId
      });
    }

    return settings[0].current.accounts;
  }

  /**
   * Calculates a forecast amount for open periods, which means doing a calculation for what we think the user will
   * waste in the whole period based in what he has wasted already
   *
   * @param {IWastePerAccount[]} amountPerAccounts
   * @param {IWaste} totalAmount
   * @param start
   * @param end
   */
  public static calculateForecastedAmount(
    amountPerAccounts: IWastePerAccount[], totalAmount: IWaste, start: string, end: string): void {
    const endDate: Date = new Date(end);
    const today: Date = new Date();

    /*
     * closed period
     */
    if (endDate < today) {
      return;
    }
    const daysFromStartUntilNow = moment().diff(moment(start, 'YYYY-MM-DD'), 'days') + 1;
    const totalDays = moment(end).diff(moment(start, 'YYYY-MM-DD'), 'days') + 1;

    let forecastedAccumulator = 0;
    for (let account of amountPerAccounts) {
      /*
       * TODO: Search for a library for BIGINT handling
       */
      const actualAmount: number = +account.actualAmount;
      const forecastedAmount = actualAmount + (actualAmount / daysFromStartUntilNow) * (totalDays - daysFromStartUntilNow);
      forecastedAccumulator += forecastedAmount;
      account.forecastedAmount = Math.round(forecastedAmount).toString();
    }

    totalAmount.forecastedAmount = Math.round(forecastedAccumulator).toString();
  }

}
