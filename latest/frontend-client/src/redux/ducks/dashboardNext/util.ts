import {
  ApiDashboardMetric,
  DashboardMetricId,
  StatusMetric,
  UnitPoint
} from 'redux/ducks/dashboardNext/index';
import { Growth } from 'metrics/StatusBar';

type MetricOptions = {
  noTrend?: boolean; // whether metric has trend and should display trend colors
  trendThreshold?: number; // if set, trend must be >= threshold value to be interpreted as positive, default is 0
  hasTrendInverted?: boolean; // if enabled, trend >= threshold is interpreted as negative
};

interface GetTrendChangeOptions {
  inverted?: boolean;
  threshold?: number;
}

const dashboardMetricOptionsById: { [id in DashboardMetricId]: MetricOptions } = {
  registration_frequency: {
    trendThreshold: 100 // only positive when registrations on all target days
  },
  per_guest_waste: {
    hasTrendInverted: true
  },
  total_waste: {
    hasTrendInverted: true
  },
  co2_waste: {
    noTrend: true
  },
  per_guest_saved: {
    hasTrendInverted: true
  },
  per_guest_avoidable: {
    hasTrendInverted: true
  }
};

function getTrendChange(trend: number, options: GetTrendChangeOptions = {}): Growth {
  const { inverted = false, threshold = 0 } = options;

  if (trend === threshold) {
    return 'equal';
  }

  if (inverted) {
    return trend > threshold ? 'negative' : 'positive';
  }

  return trend >= threshold ? 'positive' : 'negative';
}

function getGrowth(metric: ApiDashboardMetric): Growth {
  const { trend, target, point } = metric;
  const settings = dashboardMetricOptionsById[metric.id];

  if (settings.noTrend) {
    return 'noTrend';
  }

  if (target && target.value === 0) {
    return 'noTarget';
  }

  if (point.value === 0) {
    return 'noData';
  }

  return getTrendChange(trend, {
    inverted: settings.hasTrendInverted,
    threshold: settings.trendThreshold
  });
}

interface MetricFactoryOptions {
  status?: UnitPoint;
}

export function createStatusMetric(
  metric: ApiDashboardMetric,
  options: MetricFactoryOptions = {}
): StatusMetric {
  const { point, target, trend } = metric;
  const { status: noTrendStatus } = options;
  const growth = getGrowth(metric);
  const status = noTrendStatus || { value: trend, unit: '%' };
  return {
    id: metric.id,
    point,
    target,
    status,
    growth
  };
}

export function mapToStatusMetrics(metrics: ApiDashboardMetric[]): StatusMetric[] {
  return metrics.map((metric) => {
    switch (metric.id) {
      case 'registration_frequency': {
        const { point, target } = metric;
        return createStatusMetric(metric, {
          status: {
            value: Math.abs(target.value - point.value),
            unit: undefined
          }
        });
      }
      case 'co2_waste': {
        const wasterPerPortionInGrams = 400;
        const { point: totalWaste } = metrics.find((m) => m.id === 'total_waste') || {};
        const numOfMeals = totalWaste ? totalWaste.value / wasterPerPortionInGrams : 0;
        return createStatusMetric(metric, {
          status: {
            value: Math.round(numOfMeals),
            unit: undefined
          }
        });
      }
      default:
        return createStatusMetric(metric);
    }
  });
}
