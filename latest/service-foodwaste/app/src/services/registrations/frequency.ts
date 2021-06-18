import * as errors from '@feathersjs/errors';
import * as queries from './util/sql-queries';
import Moment from 'moment';
import { getPeriodLabelFormatter } from './util/util';
import Account = SettingsNamespace.Account;
import Settings = SettingsNamespace.Settings;

let moment = Moment.utc;

import 'moment-weekday-calc';
import ExpectedFrequency = SettingsNamespace.ExpectedFrequency;

const subModule: string = 'registrations-frequency';
let requestId: string;
let sessionId: string;

export interface RegistrationObj {
  customer_id: string; // it is snake_case because we run a raw query and sequelize returns the column names unchanged
  dow: number; // day of week
  date: string; // the date in YYYY-MM-DD format
  date_timestamp: number; // the date as a timestamp
}

export interface Response {
  onTarget: boolean;
  pointerLocation: number;
  accounts: any[];
  accountsWithoutSettings?: string[];
}

export interface AccountData {
  accountId: string;
  onTarget: boolean;
  frequency: number;
  name: string;
  trend: any[];
}

export default class Frequency {
  app: any;
  private static periodFormatter: any;

  constructor(app: any) {
    this.app = app;
  }

  /**
   * Gets the settings for the given accounts (or just the requesting customer, if no accounts are provided in the input)
   * and the registration days for the given time period. Then calculates the frequency of registrations against the
   * settings of each account and returns whether overall all accounts have met their expected registrations per day
   * (according to their settings).
   * If a period is specified, then do the same calculations for 5 periods back in time.
   *
   * @param {object}  params { start: string, end: string, customerId: string, accounts: [<string>] }
   * @return Promise<{ onTarget: boolean; pointerLocation: number, accountsWithoutSettings: [] }>
   */
  public async find(params): Promise<any> {
    requestId = params.requestId;
    sessionId = params.sessionId;
    const start: string = params.query.start;
    const endInput: string = params.query.end;
    const period: Moment.unitOfTime.DurationConstructor = params.query.period;
    let accountIds: string[] = params.query.accounts ? params.query.accounts.toString().split(',') : [];
    const customerId: string = params.query.customerId.toString();

    if (accountIds.length === 0) {
      /*
       * If the user hasn't selected any accounts (none given in the req input) then get data only for the user's
       * account itself
       */
      accountIds.push(params.query.customerId.toString());
    }

    /*
     * If it is an open period (end date is bigger than today) we want to take in consideration the registration-required
     * days only until today. This way, if account requires Mon-Fri and today is Wed, and they have made regs all the days
     * from Mon to Wed, then the result should still be 150 "on-target".
     */
    const end: string = new Date(endInput) < new Date() ? endInput : moment().format('YYYY-MM-DD');

    let { settingsPerAccount, accountsWithoutSettings, accountsToQuery, accountNames } =
      await this.getSettingsOfAccounts(accountIds, customerId);

    const { regsToHavePerDOW, totalsPerAcc } =
      Frequency.combineRegsFrequencyAndTotalsPerAccount(start, end, accountsToQuery, settingsPerAccount);
    const registrations: RegistrationObj[] = await this.getDaysWithRegistrations(accountsToQuery, start, end);
    /*
     * the `totalsPerAcc` object is passed by value and modified in-scope
     */
    Frequency.calcRegsFrequencyPerAccount(registrations, totalsPerAcc, regsToHavePerDOW);
    const response: Response = Frequency.buildResponse(totalsPerAcc, accountNames);

    /*
     * If 'period' is provided in the input, it means trends must be calculated.
     */
    if (period) {
      Frequency.periodFormatter = getPeriodLabelFormatter(period);
      const trendPromises: Promise<any>[] = [];

      for (let i = 1; i <= 5; i++) {
        const pastStart = moment(start).subtract(i, period).format('YYYY-MM-DD');
        const pastEnd = moment(endInput).subtract(i, period).format('YYYY-MM-DD');

        trendPromises.push(this.buildTrends(pastStart, pastEnd, accountsToQuery, settingsPerAccount));
      }

      const trends = await Promise.all(trendPromises);

      for (const acc of response.accounts) {
        for (const trend of trends) {
          acc.trend.push(trend[acc.accountId]);
        }
      }
    }

    return Object.assign(response, { accountsWithoutSettings });
  }

  /**
   * Calculates the overall onTarget and frequency values for all accounts combined AND also per account, whilst
   * constructing an object <AccountData> of data for each account.
   *
   * @param {object}  totalsPerAcc  The total expected and registered days per account. Looks like:
   * {
   *  '28143': {
   *    expectedDays: {number},
   *    registeredDays: {number}
   *  },
   *  '33871': { ... }
   * }
   * @param {object}  accountNames  An object where the key is the account ID {string} and the value is the name {string}
   * @return {Response}
   */
  public static buildResponse(totalsPerAcc: any, accountNames: any): Response {
    let totalExpectedDays: number = 0;
    let totalRegisteredDays: number = 0;
    const accounts: AccountData[] = [];

    for (const accId in totalsPerAcc) {
      totalExpectedDays += totalsPerAcc[accId].expectedDays;
      totalRegisteredDays += totalsPerAcc[accId].registeredDays;

      const accountData = Frequency.calcOnTargetAndValue(totalsPerAcc[accId].expectedDays, totalsPerAcc[accId].registeredDays);
      accounts.push({
        accountId: accId,
        onTarget: accountData.onTarget,
        frequency: accountData.frequency,
        name: accountNames[accId],
        trend: []
      });
    }

    const { onTarget, frequency } = Frequency.calcOnTargetAndValue(totalExpectedDays, totalRegisteredDays);

    log.debug({
      onTarget, frequency, accounts, totalExpectedDays, totalRegisteredDays, subModule, requestId, sessionId
    }, 'Calculated total frequency of registration days for all accounts and whether all-together they are on target');

    return { onTarget, pointerLocation: frequency, accounts };
  }

  /**
   * Calculates the onTarget and frequency values for past periods.
   *
   * @param {string}  start         The start date of the period
   * @param {string}  end           The end date of the period
   * @param {string[]} accountIds   The IDs of accounts to get data for
   * @param {any}      settings     The settings per account
   * @return {Promise<any>}  A list of trend objects for all given accounts, for the given period
   */
  public async buildTrends(start: string, end: string, accountIds: string[], settings: any): Promise<any> {
    const { regsToHavePerDOW, totalsPerAcc } =
      Frequency.combineRegsFrequencyAndTotalsPerAccount(start, end, accountIds, settings);

    const registrations: RegistrationObj[] = await this.getDaysWithRegistrations(accountIds, start, end);
    /*
     * the `totalsPerAcc` object is passed by value and modified in-scope
     */
    Frequency.calcRegsFrequencyPerAccount(registrations, totalsPerAcc, regsToHavePerDOW);

    const dataPerAccount: any = {};

    for (const accId in totalsPerAcc) {
      const data = Frequency.calcOnTargetAndValue(totalsPerAcc[accId].expectedDays, totalsPerAcc[accId].registeredDays);

      dataPerAccount[accId] = {
        onTarget: data.onTarget,
        percentage: data.frequency,
        periodLabel: Frequency.periodFormatter(start)
      };
    }

    log.debug({
      dataPerAccount, start, end, subModule, requestId, sessionId
    }, 'Calculated whether each account in past periods have been on target with the registration days');

    return dataPerAccount;
  }

  /**
   * Get the days with registrations for each customer for the given period. The days come as numbers according to their
   * position in the week, where Sunday = 0.
   *
   * @param {array}   accounts  The accounts for which to find registration days
   * @param {string}  start     The start date of the period for which to get registrations
   * @param {string}  end       The end date of the period for which to get registrations
   * @return {RegistrationObj[]} A list of registrations for all given accounts for a certain time period
   */
  public async getDaysWithRegistrations(accounts: string[], start: string, end: string): Promise<RegistrationObj[]> {
    const getRegsSQL: string =
      'SELECT customer_id, extract(dow from date) AS dow, date ' +
      '  FROM (' +
      '    SELECT distinct customer_id, date ' +
      '    FROM registration ' +
      '    WHERE customer_id IN ( :accounts ) ' +
      '      AND date >= :start ' +
      '      AND date <= :end ' +
      '      AND deleted_at IS NULL' +
      '  ) AS regs ' +
      'GROUP BY customer_id, date ' +
      'ORDER BY customer_id;';

    try {
      const registrations: RegistrationObj[] = await this.app.get('sequelize').query(getRegsSQL, {
        replacements: { accounts, start, end },
        type: this.app.get('sequelize').QueryTypes.SELECT
      });

      log.info({
        accounts, subModule, requestId, sessionId
      }, 'Retrieved registration days for accounts for a time period');

      return registrations;

    } catch (err) {
      throw new errors.GeneralError('Could not get registrations for the subscribed customers in a given period', {
        errors: err, subModule, requestId, sessionId, accounts, start, end, errorCode: 'E189'
      });
    }
  }

  /**
   * Calculates whether the registrations of foodwaste for the given accounts are on target for the given period.
   * NOTE: this function modifies `totalsPerAcc` in-scope and does not return anything.
   *
   * @param {RegistrationObj[]}  registrations  A list of the registrations pulled for all accounts for a given period.
   * @param {object}  totalsPerAcc  The total expected and registered days per account. Looks like:
   * {
   *  '28143': {
   *    expectedDays: {number},
   *    registeredDays: {number}  // passed as 0 and accumulated in this function
   *  },
   *  '33871': { ... }
   * }
   * @param {object}  regsToHavePerDOW  The account settings, specifying how many registrations should be made per DOW.
   *                                    The settings might be changed over time, so they will be separated with timestamps.
   */
  public static calcRegsFrequencyPerAccount(
    registrations: RegistrationObj[], totalsPerAcc: any, regsToHavePerDOW: any): void {

    for (const reg of registrations) {
      const accId = reg.customer_id;
      const regDate: number = +new Date(reg.date);

      const settings = regsToHavePerDOW[accId];
      const settingsKeys = Object.keys(settings);

      for (let index = 0; index < settingsKeys.length; index++) {
        const settingsDate: number = +new Date(settingsKeys[index]);

        /*
         * If the registration made on a certain date, for an account, is made on a DOW that the account hasn't included
         * in their settings, then continue to the next iterations, cuz maybe the reg belongs in the next settings-change interval
         */
        if (regsToHavePerDOW[accId][settingsKeys[index]][reg.dow] === undefined) {
          continue;
        }

        if (index === settingsKeys.length - 1) {
          if (regDate > settingsDate || regDate - settingsDate === 0) {
            totalsPerAcc[accId].registeredDays++;
          }
        } else {
          if ((regDate > settingsDate || regDate - settingsDate === 0) && regDate < +new Date(settingsKeys[index + 1])) {
            totalsPerAcc[accId].registeredDays++;
            break;
          }
        }
      }
    }

    log.debug({
      totalsPerAcc
    }, 'Calculated frequency of registration days per accounts');
  }

  /**
   * Get the settings for the given accounts (customer IDs). If an account does not have the `registrationsFrequency`
   * settings set, they are not considered in the further calculations of registrations frequency.
   *
   * @param {array}   accounts  The accounts for which to retrieve settings
   * @param {string}  customerId
   * @return Constructs a few objects:
   * regsToHavePerDOW: {
   *  '28143': {        // account ID
   *    '0': {          // timestamp, specifying from when the nested settings are valid. 0 = epoch
   *      '1': 2,
   *      '2': 3,       // the key is the day of the week, where Monday = 1 and Sunday = 0 and the value is how many
   *      '5': 2        // registrations should the account have for the given DOW for the given start->end period
   *    },
   *    '1533859200': { // now, this timestamp specifies change in the settings for the account. Registrations which
   *      '6': 2,       // were made >= this timestamp should oblige these frequency of regs. settings
   *      '0': 2
   *    }
   *  },
   *  '33871': { ... }
   * }
   ***
   * totalsPerAcc: {
   *  '28143': {
   *    expectedDays: {number},
   *    registeredDays: {number} // initiated as 0. How many days have been registered is calculated later on
   *  },
   *  '33871': { ... }
   * }
   ***
   * accountNames: {
   *  '28143': 'Some company name'
   *  '33871': 'Another company, yo'
   * }
   */
  //  { settingsPerAccount, accountsWithoutSettings, accountsToQuery, accountNames }
  public async getSettingsOfAccounts(accounts: string[], customerId: string): Promise<{
    settingsPerAccount: { [accountId: string]: ExpectedFrequency[] };
    accountsWithoutSettings: string[];
    accountsToQuery: string[];
    accountNames: { [accountId: string]: string }
  }> {
    const accountsToQuery: string[] = [];
    let accountsWithoutSettings: string[] = [];
    const settingsPerAccount: { [accountId: string]: ExpectedFrequency[] } = {};
    const accountNames: { [accountId: string]: string } = {};
    let settings: Settings[];
    const tempAccounts: string[] = [customerId].concat(accounts);

    try {
      settings = await this.app.get('sequelize').models.settings.findAll(queries.accountsSettings(tempAccounts));

      /*
       * I will hate myself for not explaining the "why" of the following 4 lines. (gako)
       * (just a mind experiment... ahihihihi)
       */
      const index: number = settings.findIndex(setting => +customerId === +setting.customerId);
      const subscribedAccounts: Account[] = settings[index].current.accounts;
      if (!accounts.includes(customerId)) {
        settings.splice(index, 1);
      }

      for (const setting of settings) {
        const accId = setting.customerId;

        /*
         * If an account has not set their reg. frequency and expected weekly waste settings, then they are not
         * included in further calculations.
         */
        if (!Frequency.checkAccountHasSettings(setting)) {
          accountsWithoutSettings.push(accId);
          continue;
        }

        if (+accId === +customerId) {
          accountNames[accId] = setting.current.name;
        } else {
          accountNames[accId] = subscribedAccounts[subscribedAccounts.findIndex(acc => +accId === +acc.id)].name;
        }

        accountsToQuery.push(accId);
        settingsPerAccount[accId] = setting.current.expectedFrequency;
      }

      if (accountsToQuery.length === 0) {
        throw new errors.NotFound('None of the selected accounts have set their registrations frequency ' +
          'and weekly foodwaste settings',
          {
            accounts, accountsWithoutSettings, subModule, requestId, sessionId, errorCode: 'E214'
          });
      }

      accountsWithoutSettings = accountsWithoutSettings.length > 0 ? accountsWithoutSettings : undefined;

      return { settingsPerAccount, accountsWithoutSettings, accountsToQuery, accountNames };

    } catch (err) {
      if (err.data && err.data.errorCode) {
        throw err;
      }

      throw new errors.GeneralError('Could not get the Settings for the given set of accounts', {
        errors: err, subModule, requestId, sessionId, accounts, settings, errorCode: 'E188'
      });
    }
  }

  /**
   * Calls the function to calculate the total expected waste weight and the daily expected waste weight per account,
   * for a given period, and then combines the result into simple objects where key is the account ID and value
   * is the total or daily waste weight, accordingly.
   *
   * @param {string} start  A period start date. Might be both the input one or one for a trend period
   * @param {string} end    A period end date. Might be both the input one or one for a trend period
   * @param {string[]} accountIds It might differ from the input accountIds, if some of those have no settings or do not
   *                              meet requirements for number of registration days and registration points
   * @param {Settings[]} settings The settings per account
   * @returns {array} The total [0] and the daily [1] expected waste weights per account. See function
   * "calcExpectedWasteWeightPerPeriod()" for details on the objects
   */
  public static combineRegsFrequencyAndTotalsPerAccount(start: string, end: string, accountIds: string[], settings: { [accountId: string]: ExpectedFrequency[] }): {
    regsToHavePerDOW: { [accountId: string]: { [date: string]: { [dow: number]: number } } };
    totalsPerAcc: { [accountId: string]: { expectedDays: number; registeredDays: number } }
  } {
    const totalsPerAcc: any = {};
    const regsToHavePerDOW: any = {};

    for (const accId of accountIds) {
      const {
        regsToHavePerDOW: regsPerDOW,
        totals
      } = Frequency.calcNumberOfRegsToHavePerDOW(settings[accId], start, end);
      regsToHavePerDOW[accId] = regsPerDOW;
      totalsPerAcc[accId] = totals;
    }

    return { regsToHavePerDOW, totalsPerAcc };
  }

  /**
   * Constructs the following objects:
   ** how many regs. should be done per DOW for a given period
   ** the total expected and registered (initialized as 0) days
   *
   * @param {any}       settings  The frequency settings of a single account
   * @param {string}    start     The input/original start date
   * @param {string}    end       The input/original end date
   * @return {(any)[]}  The registrations to be done per DOW and the total expected days of regs, per account.
   *                    Basically, this function's result is combined in the result of getSettingsOfAccounts()
   * regsToHavePerDOW: {
   *    '0': {          // timestamp, specifying from when the nested settings are valid. 0 = epoch
   *      '1': 2,
   *      '2': 3,       // the key is the day of the week, where Monday = 1 and Sunday = 0 and the value is how many
   *      '5': 2        // registrations should the account have for the given DOW for the given start->end period
   *    }
   *  }
   **
   * totalPerAcc: {
   *    expectedDays: {number},
   *    registeredDays: 0       // How many days have been registered is calculated later on
   *  }
   */
  public static calcNumberOfRegsToHavePerDOW(settings: ExpectedFrequency[], start: string, end: string): {
    regsToHavePerDOW: { [date: string]: { [dow: number]: number } };
    totals: { expectedDays: number; registeredDays: number }
  } {
    const regsToHavePerDOW: { [date: string]: { [dow: number]: number } } = {};
    const totals: { expectedDays: number; registeredDays: number } = { expectedDays: 0, registeredDays: 0 };
    const inputStartDate: number = +new Date(start);
    const inputEndDate: number = +new Date(end);
    const frequenciesByDate = settings.reduce((all, curr) => ({
      ...all,
      [curr.from]: curr
    }), {} as { [date: string]: ExpectedFrequency });

    const frequencyDates: string[] = settings.map(setting => setting.from).sort((a, b) => moment(a).valueOf() - moment(b).valueOf());

    /*
     * If there's only 1 record in the frequency settings, it's the initial one, so we basically
     * want the start->end period only.
     */
    if (frequencyDates.length === 1) {
      const date: string = frequencyDates[0];
      const data = Frequency.calcNumberOfDOW(start, end, frequenciesByDate[date]);

      regsToHavePerDOW[date] = data.numberOfDOWs;
      totals.expectedDays += data.expectedDays;

      return { regsToHavePerDOW, totals };
    }

    /*
     * Loop through the settings-changes and depending on the input start->end period and the dates when settings were
     * changed, construct an object of how many times a DOW occurs in a certain period.
     * First, rule out edge cases. If not an edge case - loop normally.
     */
    for (let index = 0; index < frequencyDates.length; index++) {
      const date: string = frequencyDates[index];
      const currentLoopDate: number = +new Date(date);
      /*
       * If the input end date is smaller than the current settings-change date, then no need to loop anymore,
       * since the period is not requested
       */
      if (inputEndDate < currentLoopDate) break;

      /*
       * If the dates of both current and next settings-change are smaller (earlier) than the input start date,
       * then we simply skip the current setting, cuz no registrations will be pulled for that period anyway
       */
      if (index !== frequencyDates.length - 1 &&
        (currentLoopDate < inputStartDate && +new Date(frequencyDates[index + 1]) < inputStartDate)) {
        continue;
      }
      /*
       * If the date of the current settings-change record is smaller than the input start date AND it is the last record,
       * then use the input start and end for calculating number of DOWs and finish looping
       */
      if (currentLoopDate < inputStartDate && index === frequencyDates.length - 1) {
        const data = Frequency.calcNumberOfDOW(start, end, frequenciesByDate[date]);

        regsToHavePerDOW[date] = data.numberOfDOWs;
        totals.expectedDays += data.expectedDays;
        break;
      }
      /*
       * If the date of the current settings-change is smaller or equal to the input start date AND the date of the next
       * settings-change is bigger than the input end date, then use the input dates as start and end of the period
       * and stop looping, since we don't want to pull data for anything after the input end date
       */
      if ((currentLoopDate < inputStartDate || currentLoopDate - inputStartDate === 0) &&
        inputEndDate < +new Date(frequencyDates[index + 1])) {
        const data = Frequency.calcNumberOfDOW(start, end, frequenciesByDate[date]);

        regsToHavePerDOW[date] = data.numberOfDOWs;
        totals.expectedDays += data.expectedDays;
        break;
      }
      /*
       * It might happen that the the input start date is equal to AND the input end date is bigger than the next
       * settings-change date. In this case down the function the endDateCalc will end up 1 day smaller than the
       * startDateCalc, which is wrong. In that case:
       * - if it's the last record, then just use the input dates and stop looping
       * - otherwise skip this rotation, and it will be covered by the next rotation
       */
      if (+new Date(frequencyDates[index + 1]) - inputStartDate === 0 && +new Date(frequencyDates[index + 1]) < inputEndDate) {
        if (index === frequencyDates.length - 1) {
          const data = Frequency.calcNumberOfDOW(start, end, frequenciesByDate[date]);

          regsToHavePerDOW[date] = data.numberOfDOWs;
          totals.expectedDays += data.expectedDays;
          break;
        } else {
          continue;
        }
      }

      /*
       * The edge cases are covered by now. Now simply loop through the settings-changes and:
       * - use current settings-change date as start period, if smaller than input start date
       * - use next settings-change date as end of current period, if it's not the last iteration. The case where
       * input end date is smaller than the next settings-change date has been covered as an edge case already.
       */
      let startDateCalc: string = date;
      let endDateCalc: string;

      /*
       * If it's the last iteration, then use the input end date as end date for calculation.
       * Otherwise, if the input end date is smaller than the next settings-change date, then we wanna use it and
       * finish looping on the next iteration.
       * Otherwise, the input end date is bigger and we wanna iterate more.
       */
      if (index === frequencyDates.length - 1) {
        endDateCalc = end;
      } else {
        endDateCalc = inputEndDate < +new Date(frequencyDates[index + 1]) ? end :
          moment(frequencyDates[index + 1]).subtract(1, 'day').format('YYYY-MM-DD');
      }

      if (currentLoopDate < inputStartDate) {
        startDateCalc = start;
      }

      const data = Frequency.calcNumberOfDOW(startDateCalc, endDateCalc, frequenciesByDate[date]);

      regsToHavePerDOW[startDateCalc] = data.numberOfDOWs;
      totals.expectedDays += data.expectedDays;
    }

    return { regsToHavePerDOW, totals };
  }

  /**
   * Simply runs calculations to determine `onTarget` and `frequency` values, depending on the given expected and
   * registered foodwaste days.
   * NOTE: if `onTarget` is True, then `frequency` is set to 150 by default, w/o calculating the days.
   *
   * @param {number} expectedDays
   * @param {number} registeredDays
   * @return {object} {onTarget: boolean; frequency: number}
   */
  public static calcOnTargetAndValue(expectedDays: number, registeredDays: number) {
    const onTarget: boolean = registeredDays === expectedDays;
    const frequency: number = onTarget ? 150 : Math.round((registeredDays / expectedDays) * 100);

    return { onTarget, frequency };
  }

  /**
   * For a given start->end dates period and a list of DOWs, calculate how many occurrences of each of the given DOWs
   * are there within the given start->end period.
   * For each calculation, increment the total expected number of registration days.
   *
   * @param {string} start
   * @param {string} end
   * @param {ExpectedFrequency} expectedFrequency   expected frequency with days, where 1 = Monday, 6 = Saturday and 0 = Sunday
   * @return {object} numberOfDOWs: { [dow: number]: number }, expectedDays: number}
   */
  public static calcNumberOfDOW(start: string, end: string, expectedFrequency: ExpectedFrequency): { numberOfDOWs: { [dow: number]: number }, expectedDays: number } {
    const listOfDOWs = expectedFrequency.days;
    const numberOfDOWs: { [dow: number]: number } = {};
    let expectedDays: number = 0;

    for (const dow of listOfDOWs) {
      /*
       * Calculates how many of a certain DOW (f.e. Monday) are there between the start and end dates
       */
      const numberOfDowForPeriod = (moment() as any).weekdayCalc(start, end, [dow]) as number;

      numberOfDOWs[dow] = numberOfDowForPeriod;
      expectedDays += numberOfDowForPeriod;
    }

    return { numberOfDOWs, expectedDays };
  }

  /**
   * Simply checks whether the provided settings object for an account has all required settings in place.
   *
   * @param {Settings} settings
   * @return {boolean} True if all settings are in place, False otherwise
   */
  public static checkAccountHasSettings(settings: Settings): boolean {
    return !!(settings.current && settings.current.expectedFrequency && settings.current.expectedFrequency.length > 0);
  }

}
