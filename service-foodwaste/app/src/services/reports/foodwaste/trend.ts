import { Application, Params, Query, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import { Extra, Metric, Series } from '../../../declarations/reports';
import { avg, groupBy } from '../../../util/array';
import { changeRatio, round } from '../../../util/math';
import moment from 'moment';
import { createPeriod, REGISTRATION_DATE_FORMAT } from '../../../util/datetime';
import { Moment } from 'moment';
import { ExpectedWasteTarget } from '../../targets/foodwaste';
import * as totalQueries from './util/total-queries';
import * as perGuestQueries from './util/per-guest-queries';
import { FOODWASTE_RESOURCE_TYPES } from '../../../util/constants';

interface FoodwasteTrendReport {
  series: Series[];
  metrics: Metric[];
  extra: Extra;
}

interface MonthlyAmount {
  date: string;
  amount: number;
}

const PercentageCoeff = 100;

// TODO rename consistently in all report endpoints
enum REPORT_IDS {
  trend = 'trend',
  trendBestMonth = 'trendBestMonth',
  trendWorstMonth = 'trendWorstMonth'
}

export const FOODWASTE_REPORT_IDS = {
  [FOODWASTE_RESOURCE_TYPES.total]: Object.keys(REPORT_IDS).reduce((obj, key) => ({
    ...obj,
    [REPORT_IDS[key]]: 'foodwasteTotal' + REPORT_IDS[key][0].toLocaleUpperCase() + REPORT_IDS[key].slice(1)
  }), {}),
  [FOODWASTE_RESOURCE_TYPES.perGuest]: Object.keys(REPORT_IDS).reduce((obj, key) => ({
    ...obj,
    [REPORT_IDS[key]]: 'foodwastePerGuest' + REPORT_IDS[key][0].toLocaleUpperCase() + REPORT_IDS[key].slice(1)
  }), {})
};

class FoodwasteTrendReportService implements SetupMethod, Pick<ServiceMethods<FoodwasteTrendReport>, 'find'> {
  app: Application;
  sequelize: Sequelize;
  targetService: any;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
    this.targetService = app.service('/targets/foodwaste');
  }

  async find(params: Params): Promise<FoodwasteTrendReport> {
    const { customerId, dimension, unit, registrationPointIds, resource } = params.query;
    const period = 'month';
    const date = {
      $lte: moment().format(REGISTRATION_DATE_FORMAT),
      $gte: moment().subtract(1, 'year').format(REGISTRATION_DATE_FORMAT)
    };
    const queryParams: Query = { customerId, dimension, unit, period, date, registrationPointIds, resource };
    const monthlyAmounts: MonthlyAmount[] = await this.getMonthlyAmounts(queryParams);
    const customerTargets: ExpectedWasteTarget[] = await this.targetService.find({
      query: queryParams
    });

    const monthsWithRegistrations = monthlyAmounts
      .filter(month => month.amount > 0)
      .sort((monthA, monthB) => monthA.amount - monthB.amount);

    const avgCustomerTarget: number = avg(customerTargets.map(customerTarget => customerTarget.targetsTotal)) || 0;
    const targetPerMonth: number = resource === FOODWASTE_RESOURCE_TYPES.total ? avgCustomerTarget / monthlyAmounts.length : avgCustomerTarget;
    const bestMonth: MonthlyAmount = monthsWithRegistrations.length === 0 ? {
      date: null,
      amount: 0
    } : monthsWithRegistrations[0];
    const worstMonth: MonthlyAmount = monthsWithRegistrations.length === 0 ? {
      date: null,
      amount: 0
    } : monthsWithRegistrations[monthsWithRegistrations.length - 1];

    const metrics: Metric[] = [
      {
        id: FOODWASTE_REPORT_IDS[resource][REPORT_IDS.trendBestMonth],
        unit,
        trend: bestMonth.date && targetPerMonth !== 0 ? round(PercentageCoeff * changeRatio(targetPerMonth, bestMonth.amount)) : 0,
        point: bestMonth.date ? {
          label: bestMonth.date,
          value: round(bestMonth.amount, 2)
        } : 0
      },
      {
        id: FOODWASTE_REPORT_IDS[resource][REPORT_IDS.trendWorstMonth],
        unit,
        trend: worstMonth.date && targetPerMonth !== 0 ? round(PercentageCoeff * changeRatio(targetPerMonth, worstMonth.amount)) : 0,
        point: worstMonth.date ? {
          label: worstMonth.date,
          value: round(worstMonth.amount, 2)
        } : 0
      }
    ];

    const series: Series[] = [{
      id: FOODWASTE_REPORT_IDS[resource][REPORT_IDS.trend],
      unit,
      aggregates: {},
      points: monthlyAmounts.map(month => ({
        label: month.date,
        value: round(month.amount, 2)
      })),
    }];

    const extra: Extra = {
      target: round(targetPerMonth, 2)
    };

    return {
      series,
      metrics,
      extra
    };
  }

  async getMonthlyAmounts(queryParams: Query): Promise<MonthlyAmount[]> {
    const { customerId, date, dimension, period, registrationPointIds, resource, guestTypeId } = queryParams;
    const query = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? perGuestQueries : totalQueries;
    const queryPeriod = createPeriod(date, period);
    // TODO refactor out to datetime utils (createTimeRange(from, to, period))
    const startDate: Moment = moment(date.$gte).startOf(period);
    const numOfPeriods: number = moment(date.$lte).diff(startDate, period) + 1;
    const dateRange: string[] = [];
    for (let i = 0; i < numOfPeriods; ++i, startDate.add(1, period)) {
      const date = startDate.format(REGISTRATION_DATE_FORMAT);
      dateRange.push(date);
    }

    const registrationsPerMonth: { date: string, amount: number }[] = (await this.sequelize.query(query.topMetricQuery(registrationPointIds, {
      dimension,
      guestTypeId
    }), {
      raw: true,
      type: this.sequelize.QueryTypes.SELECT,
      replacements: {
        customerIds: customerId,
        registrationPointIds,
        period: queryPeriod.period,
        periodInterval: `${queryPeriod.interval.count} ${queryPeriod.interval.unit}`,
        from: dateRange[0],
        to: moment(dateRange[dateRange.length - 1]).endOf(period).format(REGISTRATION_DATE_FORMAT)
      },
    })).map(record => ({
      ...record,
      amount: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.amount : parseInt(record.amount)
    }));

    // 07-2020: 2549105
    const registrationByDate: { [index: string]: { date: string, amount: number }[] } = groupBy(registrationsPerMonth, 'date');
    return dateRange.map(month => ({
      date: month,
      amount: (registrationByDate[month] && registrationByDate[month][0].amount) || 0
    }));
  }

}

export default FoodwasteTrendReportService;
export { REPORT_IDS };
