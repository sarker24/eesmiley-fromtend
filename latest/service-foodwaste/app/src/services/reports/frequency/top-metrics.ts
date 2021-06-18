import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';

import { Metric } from '../../../declarations/reports';
import moment from 'moment';
import { REGISTRATION_DATE_FORMAT } from '../../../util/datetime';
import { topMetricQuery } from './util/top-metric-queries';
import { changeRatio, round } from '../../../util/math';

interface TopMetrics {
  avgRegistrationDaysPerWeek: number;
  avgRegistrationsPerDay: number;
}

interface FrequencyTopMetric {
  metrics: Metric[];
}

enum METRIC_IDS {
  avgRegistrationDaysPerWeek = 'frequencyAvgRegistrationDaysPerWeek',
  avgRegistrationsPerDay = 'frequencyAvgRegistrationsPerDay',
}

const PercentageCoeff = 100;

class TopMetricService implements SetupMethod, Pick<ServiceMethods<FrequencyTopMetric>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<FrequencyTopMetric> {
    const { customerId, date: selectedPeriod, period = 'month' } = params.query;
    // with frequency endpoint, only previous period is required
    const previousPeriodStart: string = moment(selectedPeriod.$gte).subtract(1, period).format(REGISTRATION_DATE_FORMAT);
    const previousPeriodEnd: string = moment(selectedPeriod.$gte).subtract(1, 'day').format(REGISTRATION_DATE_FORMAT);
    const periodInterval: string = '1 ' + (period === 'quarter' ? 'month' : period);
    const queryParams = {
      raw: true,
      plain: true, // return first result instead of array
      type: this.sequelize.QueryTypes.SELECT
    };
    const commonReplacements = {
      customerId,
      period,
      periodInterval
    };

    const currentPeriodMetrics: TopMetrics = await this.sequelize.query(topMetricQuery, {
      ...queryParams,
      replacements: {
        ...commonReplacements,
        from: selectedPeriod.$gte,
        to: selectedPeriod.$lte
      }
    });

    const previousPeriodMetrics: TopMetrics = await this.sequelize.query(topMetricQuery, {
      ...queryParams,
      replacements: {
        ...commonReplacements,
        from: previousPeriodStart,
        to: previousPeriodEnd
      }
    });

    const metrics: Metric[] = Object.keys(METRIC_IDS).map(metricKey => {
      const currentPeriodMetric: number = currentPeriodMetrics[metricKey];
      const previousPeriodMetric: number = previousPeriodMetrics[metricKey];

      return {
        id: METRIC_IDS[metricKey],
        unit: null,
        point: round(currentPeriodMetric, 2),
        trend: previousPeriodMetric === 0 ? 0 : round(PercentageCoeff * changeRatio(previousPeriodMetric, currentPeriodMetric), 2)
      };

    });

    return { metrics };
  }
}

export default TopMetricService;
export { METRIC_IDS };
