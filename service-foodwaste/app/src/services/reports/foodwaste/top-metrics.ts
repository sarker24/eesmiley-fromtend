import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import { Metric } from '../../../declarations/reports';
import { avg, max, min } from '../../../util/array';
import { changeRatio, round } from '../../../util/math';
import * as totalQueries from './util/total-queries';
import * as perGuestQueries from './util/per-guest-queries';
import { FOODWASTE_RESOURCE_TYPES } from '../../../util/constants';
import { createPeriod, getHistoryTimeRange } from '../../../util/datetime';

interface FoodwasteQuery {
  date: string;
  unit: string;
  amount: number;
}

export interface FoodwasteTopMetricReport {
  metrics: Metric[];
}

export enum METRIC {
  currentPeriod = 'currentPeriod',
  worstPeriod = 'worstPeriod',
  bestPeriod = 'bestPeriod',
  averagePeriod = 'averagePeriod'
}

export const FOODWASTE_METRIC_IDS = Object.freeze({
  [FOODWASTE_RESOURCE_TYPES.total]: Object.keys(METRIC).reduce((obj, key) => ({
    ...obj,
    [key]: 'foodwaste' + key[0].toLocaleUpperCase() + key.slice(1)
  }), {}),
  [FOODWASTE_RESOURCE_TYPES.perGuest]: Object.keys(METRIC).reduce((obj, key) => ({
    ...obj,
    [key]: 'foodwastePerGuest' + key[0].toLocaleUpperCase() + key.slice(1)
  }), {})
});

const PercentageCoeff = 100;
const DaysInYear = 365;

const TrendValueMappers = {
  [METRIC.worstPeriod]: max,
  [METRIC.bestPeriod]: min,
  [METRIC.averagePeriod]: avg
};

function getNumOfPeriods(queryPeriod) {
  switch (queryPeriod.period) {
    case 'day': {
      const { interval: { count } } = queryPeriod;
      if (count === 1) {
        return DaysInYear;
      }
      return count > 90 ? 12 : Math.ceil(DaysInYear / count);
    }
    case 'week': {
      return 52;
    }
    case 'month': {
      return 12;
    }
    case 'year': {
      return 12;
    }
    case 'quarter': {
      return 4;
    }
  }
}

class FoodwasteTopMetricsReportService implements SetupMethod, Pick<ServiceMethods<FoodwasteTopMetricReport>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<FoodwasteTopMetricReport> {
    const { registrationPointIds, customerId, date: selectedPeriod, period = 'month', unit, dimension, resource, guestTypeId } = params.query;
    // requirement: include past 12 running months
    // for years - 12 years, or else no data
    const queryPeriod = createPeriod(selectedPeriod, period);
    const historyRange = getHistoryTimeRange(queryPeriod, getNumOfPeriods(queryPeriod));
    const query = resource === FOODWASTE_RESOURCE_TYPES.perGuest ? perGuestQueries : totalQueries;

    const [currentPeriodWaste, ...foodwasteHistoryPeriods]: FoodwasteQuery[] = (await this.sequelize.query(query.topMetricQuery(registrationPointIds, { dimension, guestTypeId }), {
      replacements: {
        customerIds: customerId,
        registrationPointIds,
        from: historyRange.from,
        to: historyRange.to,
        periodInterval: `${queryPeriod.interval.count} ${queryPeriod.interval.unit}`,
        period: queryPeriod.period
      },
      type: this.sequelize.QueryTypes.SELECT
    })).map(record => ({
      ...record,
      amount: resource === FOODWASTE_RESOURCE_TYPES.perGuest ? record.amount : parseInt(record.amount)
    }));

    const metricValues: { [index: string]: number } = parseMetricValues(currentPeriodWaste, foodwasteHistoryPeriods);

    const diffsToCurrentPeriod = Object.keys(metricValues).reduce((diffs, metric) => {
      const currentPeriodMetric = METRIC.currentPeriod;
      const currentPeriodValue = metricValues[currentPeriodMetric];
      const metricValue = metricValues[metric];
      // if current metric has no registrations or current period metric has no registrations,
      // we cant build difference
      if (metricValue === 0 || currentPeriodValue === 0) {
        return { ...diffs, [metric]: 0 };
      }

      if (metric === currentPeriodMetric) {
        const previousPeriod = foodwasteHistoryPeriods[0];
        const diffToPrevious = previousPeriod.amount > 0 ? changeRatio(previousPeriod.amount, currentPeriodValue) : 0;
        return { ...diffs, [metric]: round(PercentageCoeff * diffToPrevious, 2) };
      }

      return {
        ...diffs,
        [metric]: round(PercentageCoeff * changeRatio(metricValue, currentPeriodValue), 2)
      };

    }, {});

    const metrics = Object.keys(METRIC).map(metricId => ({
      id: FOODWASTE_METRIC_IDS[resource][metricId],
      unit,
      trend: diffsToCurrentPeriod[metricId],
      point: round(metricValues[metricId], 2)
    }));

    return { metrics };

  }

}

function parseMetricValues(currentPeriodQuery: FoodwasteQuery, periodHistoryQuery: FoodwasteQuery[]): { [index: string]: number } {
  const currentPeriodValue = currentPeriodQuery ? currentPeriodQuery.amount : 0;
  const historyValues = periodHistoryQuery.map(point => point.amount);
  const allValues = [currentPeriodValue, ...historyValues].filter(value => value > 0);

  return Object.keys(TrendValueMappers).reduce((metricValues, metric) => ({
    ...metricValues,
    [metric]: allValues.length > 0 ? TrendValueMappers[metric](allValues) : 0
  }), { [METRIC.currentPeriod]: currentPeriodValue });
}

export default FoodwasteTopMetricsReportService;
