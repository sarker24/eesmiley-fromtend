import * as errors from '@feathersjs/errors';
import * as queries from './util/sql-queries';
import Moment from 'moment';
import _ from 'lodash';
import { getPeriodLabelFormatter } from './util/util';
import Account = SettingsNamespace.Account;
import Settings = SettingsNamespace.Settings;

let moment = Moment.utc;

export interface IImprovements {
  forecasted: number;
  actual: number;
  accounts: ImprovementsAccount[];
  accountIdsWithoutSettings?: number[];
}

export interface Trend {
  maxCost: number;
  improvementCost: number;
  periodLabel: string;
}

export interface TrendPerAcc {
  (id: string): Trend;
}

export interface ImprovementsAccount {
  accountId: number;
  name: string;
  actual: number;
  trend: Trend[];
}

export interface ParamsObj {
  start: string;
  end: string;
  accountIds?: string[];
  period?: string;
}

export interface StringDataPerAccount {
  (id: string): string;
}

export interface NumberDataPerAccount {
  (id: string): number;
}

export interface ObjDataPerAccount {
  (id: string): { (date: string): any };
}

const subModule: string = 'registrations-improvements';
let requestId: string;
let sessionId: string;

/**
 * This file provides functionality for the endpoint /registrations/improvements
 *
 * @param app
 * @returns Object
 */
export default class Improvements {
  private readonly minPercentOfRegs: number;
  private static readonly dateFormat = 'YYYY-MM-DD';
  private readonly sequelize;
  private static periodFormatter: any;

  public constructor(private readonly app: any) {
    this.sequelize = this.app.get('sequelize');
    this.minPercentOfRegs = this.app.get('minPercentOfRegs');
  }

  /**
   * Returns an object with information about the foodwaste cost improvements for a given period of time, giving along
   * specific results per account and per period.
   *
   * @param {object} params with requestId, sessionId, query etc.
   * @returns {Promise<IImprovements>}
   */
  async find(params) {
    requestId = params.requestId;
    sessionId = params.sessionId;
    const start: string = params.query.start;
    const end: string = params.query.end;
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
     * The majority of methods need similar argument object.
     * It's more convenient to pass a single object, than a number of comma-separated arguments
     */
    const generalizedParams: ParamsObj = { end, start, accountIds };

    let { settingsPerAccount, accountsWithoutSettings, accountsToQuery, accountNames } =
      await this.getSettingsOfAccounts(accountIds, customerId);
    let accountsCurrentPeriod: string[] = accountsToQuery;
    let accountsPastPeriods: string[] = accountsToQuery;
    /*
     * Verify that the requested accounts cover the requirement: have registration points
     */
    let accountsWithoutRegistrationPoints: { id: string; name: any }[] = undefined;
    let { averageCostPerAcc, accToVerifyRegistrationPoints } = await this.getAverageCost(accountsToQuery);
    if (accToVerifyRegistrationPoints) {
      accountsCurrentPeriod = accountsToQuery.filter((accId: string) => !accToVerifyRegistrationPoints.includes(accId));
      accountsPastPeriods = accountsCurrentPeriod;
      accountsWithoutRegistrationPoints = Improvements.matchAccIdToName(accToVerifyRegistrationPoints, accountNames);
    }

    /*
     * If no account has registration points at all, then there's nothing more to do...
     */
    if (accountsCurrentPeriod.length === 0) {
      return { maxCost: -1, improvementCost: -1, accounts: [], accountsWithoutSettings, accountsWithoutRegistrationPoints };
    }

    /*
     * Verify that the requested accounts cover the requirement: have >= 70% of registration days for the period
     */
    let accountsWithoutEnoughRegs: { id: string; name: any }[] = undefined;
    let accountsToVerifyRegs: string[] | undefined = await this.getAccountsWithoutEnoughRegs(
      { start, end, accountIds: accountsCurrentPeriod }
    );
    if (accountsToVerifyRegs) {
      accountsCurrentPeriod = accountsCurrentPeriod.filter((accId: string) => !accountsToVerifyRegs.includes(accId));
      accountsWithoutEnoughRegs = Improvements.matchAccIdToName(accountsToVerifyRegs, accountNames);
    }

    /*
     * If the overall number of accounts that match the requirements is < 70% of all accounts (with settings !), then:
     * - do not make any calculations for the input requested period
     * - in case 'period' is specified, we only want to check each account meets the registration days requirement
     * per each period, since the 'accountsToQuery' should be all accounts with settings and registration points
     */
    const numberOfAccountsMeetReq = Math.round((accountsCurrentPeriod.length / accountsToQuery.length) * 100);
    let data: any;
    let processCurrentPeriod: boolean = true;
    generalizedParams.accountIds = accountsCurrentPeriod;

    if (numberOfAccountsMeetReq < this.minPercentOfRegs) {
      processCurrentPeriod = false;

      data = {
        maxCost: -1,
        improvementCost: -1,
        accounts: []
      };

      for (const accId of accountsPastPeriods) { // we use accPastPeriods cuz it has accounts with settings and registration points
        data.accounts.push({
          accountId: accId,
          name: accountNames[accId],
          maxCost: -1,
          improvementCost: -1,
          forecastedCost: new Date(start) < new Date() ? undefined : -1,
          averageCost: -1,
          expectedWeight: -1,
          actualCost: -1,
          trend: []
        });
      }
    }

    /*
     * The request input period does not satisfy the requirements, considering the accounts data, therefore only proceed
     * to the trends calculations.
     */
    if (processCurrentPeriod) {
      // get X per account
      const [expectedWasteWeightPerAcc, expectedDailyWastePerAcc] =
        await Improvements.combineExpectedWasteWeightPerAccount(generalizedParams, settingsPerAccount);
      // get A per account
      const actualWasteCost: NumberDataPerAccount
        = await this.getActualWasteCost(generalizedParams, expectedDailyWastePerAcc, averageCostPerAcc);

      data = Improvements.calcTotalImprovement(
        generalizedParams, expectedWasteWeightPerAcc, actualWasteCost, accountNames, averageCostPerAcc
      );
    }

    /*
     * If 'period' is provided in the input, it means trends must be calculated.
     */
    if (period) {
      Improvements.periodFormatter = getPeriodLabelFormatter(period);
      const trendsPromises: Promise<any>[] = [];
      generalizedParams.period = period;

      for (let i = 1; i <= 5; i++) { // go back 5 periods
        const pastStart = moment(start).subtract(i, period).format('YYYY-MM-DD');
        const pastEnd = moment(end).subtract(i, period).format('YYYY-MM-DD');

        trendsPromises.push(this.buildTrends(
          { start: pastStart, end: pastEnd, accountIds: accountsPastPeriods }, settingsPerAccount, averageCostPerAcc
        ));
      }

      const trends = await Promise.all(trendsPromises);

      for (const account of data.accounts) {
        for (const trend of trends) {
          account.trend.push(trend[account.accountId]);
        }
      }
    }

    /*
     * Just as a sanity check, log when/if the forecasted or actual costs are > max cost (which shouldn't happen),
     * so that we can trace and reproduce possible bugs in the logic and calculations
     */
    if (data.forecastedCost > data.maxCost || data.improvementCost > data.maxCost) {
      log.error({
        response: data, params: generalizedParams, subModule, requestId, sessionId
      }, 'Forecasted and/or Actual cost should NOT be bigger than the Max cost');
    }

    return Object.assign(data, { accountsWithoutSettings, accountsWithoutRegistrationPoints, accountsWithoutEnoughRegs });
  }

  /**
   * Runs the calculations for expected daily and the actual costs for the accounts, per period.
   * It is called only for the trends scenario.
   *
   * @param {string} start        Past (not the input) period start date
   * @param {string} end          Past (not the input) period end date
   * @param {string[]} accountIds It might differ from the input accountIds, if some of those have no settings or do not
   *                              meet requirements for number of registration days and registration points
   * @param {any}         settingsPerAcc    The settings of each of the queried accounts
   * @param {StringDataPerAccount}  averageCostPerAcc The average cost across all registration points per account
   * @return {Promise<TrendPerAcc>} Trend object for a single past period, per account
   */
  public async buildTrends({ start, end, accountIds }, settingsPerAcc: any, averageCostPerAcc: NumberDataPerAccount):
    Promise<TrendPerAcc> {

    let accounts: string[] = accountIds.slice(0); // clone the input array
    /*
     * Verify that the requested accounts cover the requirement: have >= 70% of registration days for the period
     */
    try {
      const accountsWithoutEnoughRegs = await this.getAccountsWithoutEnoughRegs({ start, end, accountIds });
      if (accountsWithoutEnoughRegs) {
        accounts = accounts.filter(accId => !accountsWithoutEnoughRegs.includes(accId));
      }
      /*
       * If there are no accounts that meet the requirement, just build the trends with -1 values
       */
      if (accounts.length === 0) {
        return Improvements.calcTrendImprovement({ start, end }, {} as NumberDataPerAccount, {} as NumberDataPerAccount,
          {} as NumberDataPerAccount, accountsWithoutEnoughRegs);
      }

      // get E per account
      const [expectedWasteWeight, expectedDailyWaste] = Improvements.combineExpectedWasteWeightPerAccount(
        { start, end, accountIds: accounts }, settingsPerAcc
      );
      // get A per account
      const actualWasteCost = await this.getActualWasteCost(
        { start, end, accountIds: accounts }, expectedDailyWaste, averageCostPerAcc);

      return Improvements.calcTrendImprovement(
        { start, end }, expectedWasteWeight, actualWasteCost, averageCostPerAcc, accountsWithoutEnoughRegs
      );
    } catch (err) {
      if (err.data && err.data.errorCode) {
        throw err;
      }

      throw new errors.GeneralError('Could not build trends of foodwaste improvement for a certain period', {
        errors: err, subModule, requestId, sessionId, accountIds, start, end, errorCode: 'E207'
      });
    }
  }

  /**
   * Calculates the improvement for each account, given expected waste weight, actual waste cost from registrations
   * and the average cost.
   * From the calculations, a 'trend' object is built, per account.
   *
   * @param {string}  start        Past (not the input) period start date
   * @param {string}  end          Past (not the input) period end date
   * @param {object}  expectedWeight  Expected daily waste, per account. Might be distributed according to settings changes
   * @param {object}  actualCost      The actual cost of waste per account
   * @param {object}  averageCost     The average cost per account
   * @param {string[]}  accNotEnoughRegs  List of account IDs which do not meet the requirement of 70% of registrations
   * @return {TrendPerAcc} Trend object for a single past period, per account
   */
  public static calcTrendImprovement({ start, end }, expectedWeight: NumberDataPerAccount, actualCost: NumberDataPerAccount,
                                     averageCost: NumberDataPerAccount, accNotEnoughRegs: string[]): TrendPerAcc {
    /*
     * If the objects do not consist of the same account IDs (as keys), then something has gone wrong along the way...
     */
    if (Object.keys(expectedWeight).length !== Object.keys(actualCost).length) {
      log.err({
        subModule, requestId, sessionId, start, end, expectedWeight, actualCost, errorCode: 'E208'
      }, 'While building a trend, the expected and actual foodwaste data lists did not consist of the same accounts');
    }
    const trendPerAcc = {} as TrendPerAcc;
    let periodLabel: string = Improvements.periodFormatter(start);

    for (const accId in expectedWeight) {
      const currentExpectedWeight = expectedWeight[accId];
      const currentActualCost = actualCost[accId];
      const currentAverageCost = averageCost[accId];

      const maxCost: number = Math.round(currentExpectedWeight * currentAverageCost);
      const improvementCost: number = Improvements.formatImprovementValue(maxCost - currentActualCost);
      trendPerAcc[accId] = { maxCost, improvementCost, periodLabel } as Trend;
    }
    /*
     * If there are any accounts that do not meet the requirement of min. 70% registration days for a certain period,
     * then set the values for the trend period to -1
     */
    if (accNotEnoughRegs && accNotEnoughRegs.length > 0) {
      for (const accId of accNotEnoughRegs) {
        trendPerAcc[accId] = { maxCost: -1, improvementCost: -1, periodLabel } as Trend;
      }
    }

    return trendPerAcc;
  }

  /**
   * Calculates the improvement for each account, given expected waste weight, actual waste cost from registrations
   * and the average cost.
   * From the calculations, a final response object is built for everything except the 'trends'.
   *
   * @param {string}  start        The input period start date
   * @param {string}  end          The input period end date
   * @param {object}  expectedWeight  Expected daily waste, per account. Might be distributed according to settings changes
   * @param {object}  actualCost      The actual cost of waste per account
   * @param {object}  accountNames    The name of each account
   * @param {object}  averageCost     The average cost per account
   * @returns {any}
   */
  public static calcTotalImprovement({ start, end }: ParamsObj, expectedWeight: NumberDataPerAccount, actualCost: NumberDataPerAccount,
                                     accountNames: StringDataPerAccount, averageCost: NumberDataPerAccount) {
    /*
     * If the objects do not consist of the same account IDs (as keys), then something has gone wrong along the way...
     */
    if (Object.keys(expectedWeight).length !== Object.keys(actualCost).length) {
      log.err({
        subModule, requestId, sessionId, expectedWeight, actualCost, errorCode: 'E209'
      }, 'The expected and actual foodwaste data lists should consist of the same accounts');
    }

    const totals = {
      maxCost: 0, expectedWeight: 0, actualCost: 0, improvementCost: 0, expectedCost: 0, forecastedCost: undefined
    };
    const accounts = [];
    const totalDays: number = Improvements.calcNumberOfDays(start, end);

    for (const accId in expectedWeight) {
      const currentExpectedWeight: number = expectedWeight[accId];
      const currentActualCost: number = actualCost[accId];
      const currentAverageCost: number = averageCost[accId];
      const currentExpectedCost: number = Improvements.calcExpectedCost(start, end, currentExpectedWeight, currentAverageCost, totalDays);
      const currentImprovement: number = currentExpectedCost - currentActualCost;
      const currentForecasted: number = Improvements.calcForecastedCost(start, end, currentImprovement, totalDays);
      const currentMaxCost: number = currentExpectedWeight * currentAverageCost;

      totals.expectedWeight += currentExpectedWeight;
      totals.actualCost += currentActualCost;
      totals.improvementCost += currentImprovement;
      totals.expectedCost += currentExpectedCost;
      totals.maxCost += currentMaxCost;
      if (currentForecasted) {
        totals.forecastedCost = !totals.forecastedCost ? currentForecasted : totals.forecastedCost + currentForecasted;
      }

      accounts.push({
        accountId: accId,
        name: accountNames[accId],
        maxCost: Math.round(currentMaxCost),
        improvementCost: Improvements.formatImprovementValue(currentImprovement),
        forecastedCost: Improvements.formatForecastValue(currentForecasted),
        averageCost: averageCost[accId],
        expectedCost: Math.round(currentExpectedCost),
        expectedWeight: Math.round(currentExpectedWeight),
        actualCost: Math.round(currentActualCost),
        trend: []
      });
    }

    return {
      maxCost: Math.round(totals.maxCost),
      improvementCost: Improvements.formatImprovementValue(totals.improvementCost),
      forecastedCost: Improvements.formatForecastValue(totals.forecastedCost),
      expectedCost: Math.round(totals.expectedCost),
      expectedWeight: Math.round(totals.expectedWeight),
      actualCost: Math.round(totals.actualCost),
      totalDays,
      daysUntilNow: Improvements.calcDaysUntilNow(start, end),
      accounts
    };
  }

  /**
   * Get the average cost per gram of foodwaste, by getting the median across all registration points, per account.
   *
   * If there's no data returned for some of the account IDs, that means these accounts have no registration points and are added
   * to a list of "accountsWithoutRegistrationPoints".
   *
   * @param {string[]} accountIds It might differ from the input accountIds, if some of those have no settings or do not
   *                              meet requirements for number of registration days and registration points
   * @return {Promise<any>} An object where key is the account ID and value is the average cost
   */
  public async getAverageCost(accountIds: string[]):
    Promise<{ averageCostPerAcc: NumberDataPerAccount, accToVerifyRegistrationPoints: string[] | undefined }> {

    let medianAcrossAllRegistrationPoints: any[];
    let accountsWithoutRegistrationPoints: string[] = [];

    try {
      const { sequelize } = this;
      medianAcrossAllRegistrationPoints =
        await sequelize.models.registration_point.findAll(queries.medianAcrossAllRegistrationPointCost(accountIds, sequelize));

    } catch (err) {
      throw new errors.GeneralError('Could not get the average cost across registration points for a set of accounts', {
        errorCode: 'E210', errors: err, subModule, requestId, sessionId, accountIds
      });
    }
    /*
     * [{customerId: 1, median: 300}] => {1: 300}
     */
    const averageCostPerAcc = _(medianAcrossAllRegistrationPoints)
      .keyBy('customerId')
      .mapValues('median')
      .value() as NumberDataPerAccount;

    for (const accId of accountIds) {
      if (!averageCostPerAcc[accId]) {
        accountsWithoutRegistrationPoints.push(accId);
        continue;
      }
      /*
       * NOTE: we divide by 1000, because the cost is subunit_per_kg and we want it _per_subunit (grams)
       */
      averageCostPerAcc[accId] = averageCostPerAcc[accId] / 1000;
    }

    return {
      averageCostPerAcc,
      accToVerifyRegistrationPoints: accountsWithoutRegistrationPoints.length > 0 ? accountsWithoutRegistrationPoints : undefined
    };
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
  public static combineExpectedWasteWeightPerAccount({ start, end, accountIds }: ParamsObj, settings: any):
    [NumberDataPerAccount, ObjDataPerAccount] {

    const totalExpectedWasteWeight = {} as NumberDataPerAccount;
    const expectedDailyWasteWeight = {} as ObjDataPerAccount;

    for (const accId of accountIds) {
      const data = Improvements.calcExpectedWasteWeightPerPeriod(settings[accId], start, end);
      totalExpectedWasteWeight[accId] = data.totalExpectedWaste;
      expectedDailyWasteWeight[accId] = data.expectedDailyWaste;
    }

    return [totalExpectedWasteWeight, expectedDailyWasteWeight];
  }

  /**
   * Calculates the total and the daily expected waste weight per period for a given account (its settings).
   * Alongside, calculates the amount of registration days the certain period should have.
   *
   * @param {object}  settings  The settings of a single account. Looks eg.
   * {
   *    "2018-08-27": 123000,
   *    "2018-08-29": 321000
   * }
   * @param {string}    start  A period start date. Might be both the input one or one for a trend period
   * @param {string}    end    A period end date. Might be both the input one or one for a trend period
   * @return {object} Like:
   * {
   *   "totalExpectedWaste": 321000,
   *   "expectedDailyWaste": {
   *     "2018-09-03": {
   *       "dailyWaste": 45857.142857142855,
   *       "expectedDays": 7,
   *       "registeredDays": 0
   *     }
   *   }
   * }
   */
  public static calcExpectedWasteWeightPerPeriod(settings: any, start: string, end: string):
    { totalExpectedWaste: number, expectedDailyWaste: ObjDataPerAccount } {

    const inputStartDate: number = +new Date(start);
    const inputEndDate: number = +new Date(end);
    let totalExpectedWaste: number = 0;
    const expectedDailyWaste = {} as {
      (date: string): { (dailyWaste): number, (expectedDays): number, (registeredDays): number }
    };

    /*
     * `settings` looks eg.
     * {
     *    "2018-08-27": 123000,
     *    "2018-08-29": 321000
     * }
     */
    const datesFromSettings = Object.keys(settings);

    /*
     * If there's only 1 record in the waste settings, it's the initial one, we use it for the entire input period.
     * The formula is simply X * C, since the expected waste settings are not broken into periods
     */
    if (datesFromSettings.length === 1) {
      totalExpectedWaste = settings['0'];
      expectedDailyWaste[start] = {
        dailyWaste: settings['0'] / 7,
        expectedDays: Improvements.calcDaysUntilNow(start, end),
        registeredDays: 0
      };

      return { totalExpectedWaste, expectedDailyWaste };
    }

    /*
     *
     */
    for (let index = 0; index < datesFromSettings.length; index++) {
      const date: string = datesFromSettings[index];
      const currentLoopDate: number = +new Date(date);

      /*
       * If the End date < the current settings-change date, then we stop looping, since the period is not requested
       */
      if (inputEndDate < currentLoopDate) break;

      /*
       * If the dates of both current and next settings-change are < the Start date,
       * then we simply skip the current setting, cuz no registrations will be pulled for that period anyway
       */
      if (index !== datesFromSettings.length - 1 &&
        (currentLoopDate < inputStartDate && +new Date(datesFromSettings[index + 1]) < inputStartDate)) {
        continue;
      }

      /*
       * If the date of the current settings-change record is < the Start date AND it is the last record,
       * then use the input dates as start and end for the number of days calculation and finish looping
       */
      if (currentLoopDate < inputStartDate && index === datesFromSettings.length - 1) {
        totalExpectedWaste += Improvements.calcExpectedDailyWasteForPeriod(
          settings[date], Improvements.calcNumberOfDays(start, end)
        );
        expectedDailyWaste[start] = {
          dailyWaste: settings[date] / 7,
          expectedDays: Improvements.calcDaysUntilNow(start, end),
          registeredDays: 0
        };
        break;
      }

      /*
       * If the date of the current settings-change is < or == to the Start date AND the date of the next
       * settings-change is > the End date, then use the input dates as start and end of the period
       * and stop looping, since data will not be pull for anything after the End date anyways
       */
      if ((currentLoopDate < inputStartDate || currentLoopDate - inputStartDate === 0) &&
        inputEndDate < +new Date(datesFromSettings[index + 1])) {

        totalExpectedWaste += Improvements.calcExpectedDailyWasteForPeriod(
          settings[date], Improvements.calcNumberOfDays(start, end)
        );
        expectedDailyWaste[start] = {
          dailyWaste: settings[date] / 7,
          expectedDays: Improvements.calcDaysUntilNow(start, end),
          registeredDays: 0
        };
        break;
      }
      /*
       * It might happen that the the Start date == AND the End date > the next settings-change date. In this case
       * down the function the endDateCalc will end up 1 day smaller than the startDateCalc, which is wrong.
       * In that case:
       * - if it's the last record, then just use the input dates and stop looping
       * - otherwise skip this rotation, and it will be covered by the next rotation
       */
      if (+new Date(datesFromSettings[index + 1]) - inputStartDate === 0 &&
        +new Date(datesFromSettings[index + 1]) < inputEndDate) {

        if (index === datesFromSettings.length - 1) {
          totalExpectedWaste += Improvements.calcExpectedDailyWasteForPeriod(
            settings[date], Improvements.calcNumberOfDays(start, end)
          );
          expectedDailyWaste[start] = {
            dailyWaste: settings[date] / 7,
            expectedDays: Improvements.calcDaysUntilNow(start, end),
            registeredDays: 0
          };
          break;
        } else {
          continue;
        }
      }

      /*
       * The edge cases are covered by now. Now simply loop through the settings-changes and:
       * - use current settings-change date as start period, if < Start date
       * - use next settings-change date as end of current period, if it's not the last iteration. The case where
       * End date < the next settings-change date has been covered as an edge case already.
       */
      let startDateCalc: string = date;
      let endDateCalc: string;

      /*
       * If it's the last iteration, then use the End date as end date for calculation.
       * Otherwise, if the End date is < the next settings-change date, then we wanna use it and
       * finish looping on the next iteration.
       * Otherwise, the End date > and we wanna iterate more.
       */
      if (index === datesFromSettings.length - 1) {
        endDateCalc = end;
      } else {
        endDateCalc = inputEndDate < +new Date(datesFromSettings[index + 1]) ? end :
          moment(datesFromSettings[index + 1]).subtract(1, 'day').format('YYYY-MM-DD');
      }

      if (currentLoopDate < inputStartDate) {
        startDateCalc = start;
      }

      totalExpectedWaste += Improvements.calcExpectedDailyWasteForPeriod(
        settings[date], Improvements.calcNumberOfDays(startDateCalc, endDateCalc)
      );
      expectedDailyWaste[startDateCalc] = {
        dailyWaste: settings[date] / 7,
        expectedDays: Improvements.calcDaysUntilNow(startDateCalc, endDateCalc),
        registeredDays: 0
      };
    }

    return { totalExpectedWaste, expectedDailyWaste };
  }

  /**
   * Get the actual foodwaste cost for a given list of accounts within a given time period
   *
   * @param {string} start  A period start date. Might be both the input one or one for a trend period
   * @param {string} end    A period end date. Might be both the input one or one for a trend period
   * @param {string[]} accountIds It might differ from the input accountIds, if some of those have no settings or do not
   *                              meet requirements for number of registration days and registration points
   * @param {object}  expectedDailyWaste  The expected daily waste per account and per settings changes
   * @param {object}  averageCost         The average cost per account
   * @returns {Promise<any>}  Returns an object where key is an account ID and the value is the actual foodwaste cost
   *                          for the given period
   */
  public async getActualWasteCost({ start, end, accountIds }: ParamsObj, expectedDailyWaste: ObjDataPerAccount,
                                  averageCost: NumberDataPerAccount): Promise<NumberDataPerAccount> {
    try {
      const registrations = await this.sequelize.models.registration.findAll(
        queries.getRegsCostByDistinctDate(start, end, accountIds, this.sequelize)
      );

      const actualWasteCostPerAcc = {} as NumberDataPerAccount;
      for (const accId of accountIds) {
        actualWasteCostPerAcc[accId] = 0;
      }
      /*
       * {customerId: '28143', cost: 7200, date: '2018-08-14'}
       */
      for (const reg of registrations) {
        const accId = reg.customerId;
        const regDate: number = +new Date(reg.date);
        /*
         * '28143': {
         *    '2018-08-13': {dailyWaste: 123000, expectedDays: 4, registeredDays: 0},
         *    '2018-08-17': {dailyWaste: 456000, expectedDays: 3, registeredDays: 0}
         * }
         */
        const settings = expectedDailyWaste[accId];
        const dates = Object.keys(settings);

        for (let index = 0; index < dates.length; index++) {
          const dateAsString = dates[index];
          const dateAsDate: number = +new Date(dateAsString);

          if (index === dates.length - 1) {
            if (regDate > dateAsDate || regDate - dateAsDate === 0) {
              actualWasteCostPerAcc[accId] += +reg.cost;
              settings[dateAsString].registeredDays++;
            }
          } else {
            if ((regDate > dateAsDate || regDate - dateAsDate === 0) && regDate < +new Date(dates[index + 1])) {
              actualWasteCostPerAcc[accId] += +reg.cost;
              settings[dateAsString].registeredDays++;
              break;
            }
          }
        }
      }

      for (const accId of accountIds) {
        const settings = expectedDailyWaste[accId];

        for (const date in settings) {
          const setting = settings[date];
          actualWasteCostPerAcc[accId] +=
            (setting.dailyWaste * averageCost[accId]) * (setting.expectedDays - setting.registeredDays);
        }
      }

      return actualWasteCostPerAcc;

    } catch (err) {
      throw new errors.GeneralError('Could not retrieve actual food waste cost per account', {
        errorCode: 'E212', errors: err, subModule, requestId, sessionId, accountIds
      });
    }
  }

  /**
   * Get the number of registration days per account, for a given period, and check whether they meet the requirement
   * of min. 70% registration days.
   * If not - add them to a list of accounts that don't meet the requirement, which will be used later.
   *
   * @param {string} start  A period start date. Might be both the input one or one for a trend period
   * @param {string} end    A period end date. Might be both the input one or one for a trend period
   * @param {string[]} accountIds It might differ from the input accountIds, if some of those have no settings
   * @returns {Promise<string[]>} A list of the account IDs or "undefined" if all of them meet the requirement
   */
  public async getAccountsWithoutEnoughRegs({ start, end, accountIds }): Promise<undefined | string[]> {
    try {
      const { sequelize, minPercentOfRegs } = this;
      const daysWithRegsPerAccount = await sequelize.query(queries.registrationsDaysPerAccount,
        {
          replacements: { start, end, customerIds: accountIds },
          type: sequelize.QueryTypes.SELECT
        });

      /*
       * If there are no records returned, it means none of the accounts have registrations at all. Then return them
       * all as "accounts with not enough regs"
       */
      if (daysWithRegsPerAccount.length === 0) {
        log.warn({
          subModule, requestId, sessionId, start, end, accountsWithNotEnoughRegistrations: accountIds
        }, 'None of the accounts have registrations at all!');

        return accountIds;
      }

      /*
       * Check for each returned account the amount of regs they have and if it meets the min. requirement for the period
       */
      const daysInSelectedPeriod = Improvements.calcDaysUntilNow(start, end);
      let accountsWithNotEnoughRegistrations: string[] = daysWithRegsPerAccount
        .filter(accRegs =>
          ((accRegs.registrationdaysforperiod / daysInSelectedPeriod) * 100) < minPercentOfRegs)
        .map(acc => acc.customer_id);

      /*
       * If the result from DB is smaller than the requested accounts, it means some of the accounts don't have regs
       * at all. In that case return them as "accounts with not enough regs"
       */
      let missedAccounts: string[];
      if (daysWithRegsPerAccount.length < Object.keys(accountIds).length) {
        missedAccounts = accountIds.filter((accId: string) => {
          if (daysWithRegsPerAccount.findIndex(accData => +accData.customer_id === +accId) < 0) {
            return accId;
          }
        });
        accountsWithNotEnoughRegistrations = [...accountsWithNotEnoughRegistrations, ...missedAccounts];
      }

      if (accountsWithNotEnoughRegistrations.length > 0) {
        log.warn({
          subModule, requestId, sessionId, start, end, accountsWithNotEnoughRegistrations
        }, 'Some accounts have less than 70% registration days in the period. Minimum 70% are required in order to ' +
          'calculate improvements in the foodwaste');
        return accountsWithNotEnoughRegistrations;
      }
      return undefined;

    } catch (err) {
      if (err.data && err.data.errorCode) {
        throw err;
      }

      throw new errors.GeneralError('Could not retrieve accounts to check whether they have enough registrations', {
        errorCode: 'E211', errors: err, subModule, requestId, sessionId, accountIds, start, end
      });
    }
  }

  /**
   * Get the settings for the given accounts (customer IDs). If an account does not have the `registrationsFrequency`
   * settings set, they are not considered in the further calculations of registrations frequency.
   *
   * @param {string[]}  accounts The input list of account IDs.
   * @param {string}    customerId
   * @return Constructs a few objects:
   * settingsPerAccount: {
   *  '28143': {        // account ID
   *    '0': 123000,
   *    '2018-08-13': 456000
   *  },
   *  '33871': { ... }
   * }
   ***
   * accountNames: {
   *  '28143': 'Some company name'
   *  '33871': 'Another company, yo'
   * }
   */
  public async getSettingsOfAccounts(accounts: string[], customerId: string):
    Promise<{
      settingsPerAccount: ObjDataPerAccount, accountsWithoutSettings: string[],
      accountsToQuery: string[], accountNames: StringDataPerAccount
    }> {

    const accountsToQuery: string[] = [];
    let accountsWithoutSettings: string[] = [];
    let accountNames = {} as StringDataPerAccount;
    let settingsPerAccount = {} as ObjDataPerAccount;
    let settings: Settings[] = [];
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
        const accId = setting.customerId.toString();
        /*
         * If an account has not set their expected weekly waste settings, then they are not included in further
         * calculations.
         */
        if (!Improvements.checkAccountHasSettings(setting)) {
          accountsWithoutSettings.push(accId);
          continue;
        }

        if (+accId === +customerId) {
          accountNames[accId] = setting.current.name;
        } else {
          accountNames[accId] = subscribedAccounts[subscribedAccounts.findIndex(acc => +accId === +acc.id)].name;
        }

        accountsToQuery.push(accId);
        settingsPerAccount[accId] = setting.current.expectedWeeklyWaste;
      }

      if (accountsToQuery.length === 0) {
        throw new errors.NotFound('None of the selected accounts have set their expected weekly waste settings', {
          accounts, accountsWithoutSettings, subModule, requestId, sessionId, errorCode: 'E213'
        });
      }

      accountsWithoutSettings = accountsWithoutSettings.length > 0 ? accountsWithoutSettings : undefined;

      return { settingsPerAccount, accountsWithoutSettings, accountsToQuery, accountNames };

    } catch (err) {
      if (err.data && err.data.errorCode) {
        throw err;
      }

      throw new errors.GeneralError('Could not get the Settings for the given set of accounts', {
        errors: err, subModule, requestId, sessionId, accounts, errorCode: 'E198'
      });
    }
  }

  /**
   * Simply checks whether the provided settings object for an account has all required settings in place.
   *
   * @param {Settings} settings
   * @return {boolean} True if all settings are in place, False otherwise
   */
  public static checkAccountHasSettings(settings: Settings): boolean {
    return (settings.current &&
      settings.current.expectedWeeklyWaste !== undefined &&
      Object.keys(settings.current.expectedWeeklyWaste).length > 0);
  }

  /**
   * Calculates the given from settings expectedWeeklyWaste per day for a given period. So basically, divide the
   * weekly waste by 7 and multiply by a given number of days.
   * The formula is: (X / 7) * d
   *
   * @param {number} expectedWaste  The expected waste weight (X)
   * @param {number} daysInPeriod   The number of days for a given smaller period (between settings-changes) (d)
   * @return {number}
   */
  public static calcExpectedDailyWasteForPeriod(expectedWaste: number, daysInPeriod: number): number {
    return (expectedWaste / 7) * daysInPeriod;
  }

  /**
   * Calculates the maximum expected waste cost. If it's an "open" period (the input end date is in the future), then
   * use ((X / D) * d) * C formula.
   * Otherwise simply: X * C
   *
   * @param {string} start  A period start date. Might be both the input one or one for a trend period
   * @param {string} end    A period end date. Might be both the input one or one for a trend period
   * @param {number} expectedWeight
   * @param {number} averageCost
   * @param {number} totalDays
   * @return {number}
   */
  public static calcExpectedCost
  (start: string, end: string, expectedWeight: number, averageCost: number, totalDays: number): number {
    const endDate = new Date(end);
    const today = new Date();

    // closed period
    if (endDate < today) {
      return Math.round(expectedWeight * averageCost);
    }

    const daysUntilNow: number = Improvements.calcDaysUntilNow(start, end);
    return Math.round(((expectedWeight / totalDays) * daysUntilNow) * averageCost);
  }

  /**
   * Calculate the forecasted cost, but only if it's an "open" period (the input end date is in the future from now).
   * The formula is: I + (I / d) * (D - d)
   *
   * @param {string} start  A input period start date.
   * @param {string} end    A input period end date.
   * @param {number} improvementCost  The calculated total improvement cost
   * @param {number} totalDays        The number of days for the whole input start->end period
   * @return {number | undefined}
   */
  public static calcForecastedCost(start: string, end: string, improvementCost: number, totalDays: number): undefined | number {
    const endDate = new Date(end);
    const today = new Date();

    // closed period
    if (endDate < today) {
      return undefined;
    }

    const daysUntilNow: number = Improvements.calcDaysUntilNow(start, end);
    return Math.round(improvementCost + (improvementCost / daysUntilNow) * (totalDays - daysUntilNow));
  }

  /**
   * For a given list of IDs and a list of objects with ID and name, construct an array which contains an ID and name.
   * Basically, the list of IDs is usually a list of accounts that do not meet some certain requirement and then the
   * list of objects with ID and name is the list of ALL accounts for the initial request.
   *
   * @param {string[]}              accountIds    Accounts that do not meet some certain requirement
   * @param {StringDataPerAccount}  accountNames  A list of account IDs and their names
   * @return [{id: string; name: string}]
   */
  public static matchAccIdToName(accountIds: string[], accountNames: StringDataPerAccount): { id: string; name: string }[] {
    return accountIds.map((accId: string) => {
      return { id: accId, name: accountNames[accId] };
    });
  }

  /**
   * Simply return the proper value for the improvement cost. If it's a negative number, which means the account(s)
   * have not made any improvement, then we want to return a 0 for the FE instead of a negative value.
   * If positive value, simply round it.
   *
   * @param {number} value  The improvement cost value
   * @return {number}
   */
  public static formatImprovementValue(value: number): number {
    return value < 0 ? 0 : Math.round(value);
  }

  /**
   * Simply return the proper value for the forecast cost. If it's undefined, then just return it as undefined.
   * If it's a negative number, which means the account(s) have not made any improvement, then we want to return a 0
   * for the FE instead of a negative value.
   * If positive value, simply round it.
   *
   * @param {number} value  The improvement cost value
   * @return {number}
   */
  public static formatForecastValue(value: number | undefined): number | undefined {
    if (value) {
      return value < 0 ? 0 : Math.round(value);
    }
    return value;
  }

  /**
   * Calculate the number of days between two dates.
   *
   * NOTE: Add 1 day, because moment.diff() does not include the end date in the calculation.
   *
   * @param {string} start  A period start date
   * @param {string} end    A period end date
   * @return {number}
   */
  public static calcNumberOfDays(start: string, end: string): number {
    return moment(end).diff(moment(start), 'days') + 1;
  }

  /**
   * Calculate the number of days from a given start date until today.
   *
   * @param {string} start  A period start date. Might be any start date
   * @param {string} end    A period end date. Might be any end date
   * @param {number} totalDays
   * @return {number}
   */
  public static calcDaysUntilNow(start: string, end: string, totalDays?: number): number {
    const endDate = new Date(end);
    const today = new Date();
    const startToEndDays: number = totalDays ? totalDays : Improvements.calcNumberOfDays(start, end);

    // closed period
    if (endDate < today) {
      return startToEndDays;
    }

    return Improvements.calcNumberOfDays(start, moment().format(Improvements.dateFormat));
  }

}
