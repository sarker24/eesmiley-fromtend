/* istanbul ignore file */

import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import { FOODWASTE_METRIC_IDS, FoodwasteTopMetricReport, METRIC as TOP_METRIC } from '../reports/foodwaste/top-metrics';
import { ExpectedWasteTarget, RESOURCE_TYPES } from '../targets/foodwaste/index';
import { changeRatio, round } from '../../util/math';
import { FOODWASTE_RESOURCE_TYPES } from '../../util/constants';
import { Dimension } from '../reports/foodwaste/util/common-queries';
import { CustomerDayCount } from '../reports/frequency/per-account';

// could add resource type?
// would help client to eg transform values
interface UnitPoint {
  unit?: string;
  value: number;
}

type Ratio = number;

interface DashboardMetric {
  id: string;
  target?: UnitPoint;
  trend?: Ratio;
  point: UnitPoint;
}

interface DashboardResponse {
  metrics: DashboardMetric[];
}

class DashboardService implements SetupMethod, Pick<ServiceMethods<DashboardResponse>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<DashboardResponse> {

    // we have already validated and parsed params in this service's hooks,
    // so make internal calls to other endpoints by removing provider prop.
    const { provider, ...queryParams } = params;

    const totalMetric = this.getTotalWasteMetric(queryParams);
    const perGuestMetrics = this.getPerGuestMetrics(queryParams);
    const frequencyMetric = this.getFrequencyMetric(queryParams);
    const co2Metric = this.getCO2Metric(queryParams);

    const metrics = await Promise.all([frequencyMetric, totalMetric, perGuestMetrics, co2Metric]);
    return { metrics: metrics.flatMap(metric => metric) };

  }

  async getTotalWasteMetric(params: Params): Promise<DashboardMetric> {
    const wasteAmount = await this.getTotalWasteAmount(FOODWASTE_RESOURCE_TYPES.total, 'weight', params);
    const targetAmount = await this.getTargetAmount(RESOURCE_TYPES.total, params);
    const trend = targetAmount === 0 ? 0 : 100 * changeRatio(targetAmount, wasteAmount);

    return {
      id: 'total_waste',
      point: {
        value: round(wasteAmount),
        unit: 'g'
      },
      target: { value: round(targetAmount), unit: 'g' },
      trend: round(trend)
    };

  }

  async getPerGuestMetrics(params: Params): Promise<DashboardMetric[]> {
    const wasteAmount = await this.getTotalWasteAmount(FOODWASTE_RESOURCE_TYPES.perGuest, 'weight', params);
    const targetAmount = await this.getTargetAmount(RESOURCE_TYPES.perGuest, params);
    const trend = targetAmount === 0 ? 0 : 100 * changeRatio(targetAmount, wasteAmount);

    const perGuestMetric = {
      id: 'per_guest_waste',
      point: {
        value: round(wasteAmount),
        unit: 'g'
      },
      target: { value: round(targetAmount), unit: 'g' },
      trend: round(trend)
    };

    const perGuestBaseline = await this.getBaselineMetric(perGuestMetric, params);
    const perGuestStandard = await this.getStandardMetric(perGuestMetric, params);

    return [perGuestMetric, perGuestBaseline, perGuestStandard];
  }

  async getBaselineMetric(perGuestMetric: DashboardMetric, params: Params): Promise<DashboardMetric> {
    const targetAmount = await this.getTargetAmount(RESOURCE_TYPES.perGuestBaseline, params);
    const { value: currentAmount } = perGuestMetric.point;

    const trend = currentAmount === 0 ? 0 : 100 * changeRatio(targetAmount, currentAmount);
    return {
      id: 'per_guest_saved',
      point: {
        value: currentAmount === 0 ? 0 : round(targetAmount - currentAmount),
        unit: 'g'
      },
      target: {
        value: round(targetAmount),
        unit: 'g'
      },
      trend: round(trend)
    };
  }

  async getStandardMetric(perGuestMetric: DashboardMetric, params: Params): Promise<DashboardMetric> {
    const targetAmount = await this.getTargetAmount(RESOURCE_TYPES.perGuestStandard, params);
    const { value: currentAmount } = perGuestMetric.point;

    const trend = currentAmount === 0 ? 0 : 100 * changeRatio(targetAmount, currentAmount);
    return {
      id: 'per_guest_avoidable',
      point: {
        value: currentAmount === 0 ? 0 : round(targetAmount - currentAmount),
        unit: 'g'
      },
      target: {
        value: round(targetAmount),
        unit: 'g'
      },
      trend: round(trend)
    };
  }

  async getFrequencyMetric(params: Params): Promise<DashboardMetric> {
    const frequencyReportService = this.app.service('/reports/frequency-per-account');
    const frequencyResponse = await frequencyReportService.getCustomerDayCounts(params) as CustomerDayCount[];
    const { totalTargetDays, totalOnTargetDays } = frequencyResponse.reduce((total, current) => ({
      totalTargetDays: total.totalTargetDays + current.totalTargetDays,
      totalOnTargetDays: total.totalOnTargetDays + current.onTargetDays
    }), {
      totalTargetDays: 0,
      totalOnTargetDays: 0
    });

    return {
      id: 'registration_frequency',
      target: {
        value: totalTargetDays
      },
      point: {
        value: totalOnTargetDays
      },
      trend: round(100 * (totalOnTargetDays / totalTargetDays))
    };
  }

  async getCO2Metric(params: Params): Promise<DashboardMetric> {
    const totalAmount = await this.getTotalWasteAmount(FOODWASTE_RESOURCE_TYPES.total, 'co2', params);

    return {
      id: 'co2_waste',
      point: {
        value: round(totalAmount),
        unit: 'g'
      }
    };
  }

  async getTotalWasteAmount(resource: FOODWASTE_RESOURCE_TYPES, dimension: Dimension, params: Params): Promise<number> {
    const metricId = FOODWASTE_METRIC_IDS[resource][TOP_METRIC.currentPeriod];
    const { query } = params;
    const metricParams = {
      ...params,
      query: {
        ...query, dimension, resource
      }
    };

    const reportService = this.app.service('/reports/foodwaste-top-metrics');

    // todo some day: move registration point related filter queries to registrations (points, accounts),
    // since they belong to that service, now includes some overhead due to additional metrics we calculate.
    const topMetricResponse = await (reportService.find(metricParams) as Promise<FoodwasteTopMetricReport>);
    const wasteMetric = topMetricResponse.metrics.find(metric => metric.id === metricId);
    const wasteAmount = typeof wasteMetric.point === 'number' ? wasteMetric.point : wasteMetric.point.value;
    return wasteAmount || 0;

  }


  async getTargetAmount(resource: RESOURCE_TYPES, params: Params): Promise<number> {
    const { query } = params;
    const targetService = this.app.service('/targets/foodwaste');
    const targetQueryParams = { ...params, query: { ...query, resource } };

    const targetAmountResponse = await (targetService.find(targetQueryParams) as ExpectedWasteTarget[]);
    return targetAmountResponse.reduce((total, target) => total + target.targetsTotal, 0);
  }
}

export default DashboardService;
