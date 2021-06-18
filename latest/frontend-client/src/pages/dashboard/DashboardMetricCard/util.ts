import { DashboardMetricId, StatusMetric } from 'redux/ducks/dashboardNext';
import MealIndicator from 'dashboard/MealIndicator';
import {
  formatNumber,
  FormatNumberOptions,
  MassUnit,
  transformAmount,
  TransformAmountOptions
} from 'utils/number-format';
import confusedSmiley from 'static/icons/confused-smiley.png';
import sadSmiley from 'static/icons/sad-smiley.png';
import happySmiley from 'static/icons/happy-smiley.png';
import { Growth } from 'metrics/StatusBar';
import { GaugeOptions } from 'metrics/Gauge';
import GrowthIndicator, { GrowthIndicatorProps } from 'metrics/GrowthIndicator';
import * as React from 'react';

export type DashboardMetricOptions = {
  as?: MassUnit;
  viewMore?: string;
  noTrend?: boolean; // whether metric has trend and should display trend colors
  indicator?: React.ComponentType<GrowthIndicatorProps>;
  displayGauge: boolean; // whether metric should display value as gauge
};

export const DASHBOARD_VIEW_MORE_LINKS: { [id in DashboardMetricId]: string } = {
  registration_frequency: '/report/frequency',
  per_guest_waste: '/report/foodwaste/per-guest',
  total_waste: '/report/foodwaste',
  co2_waste: '/report/foodwaste?dimension=co2',
  per_guest_saved: '/report/quick-overview',
  per_guest_avoidable: '/report/quick-overview'
} as const;

export const DASHBOARD_METRIC_INTL_KEYS: {
  [id in DashboardMetricId]: {
    title?: string;
    noTrend?: string;
    onTarget?: string;
    negative?: string;
    positive?: string;
  };
} = {
  registration_frequency: {
    title: 'report.registrationFrequency.title',
    onTarget: 'onTarget',
    negative: 'frequency.missedDays',
    positive: 'onTarget'
  },
  total_waste: {
    title: 'base.total',
    onTarget: 'onTarget',
    negative: 'moreThanTarget',
    positive: 'lessThanTarget'
  },
  co2_waste: {
    title: 'report.co2eFootprint.title',
    noTrend: 'base.meals'
  },
  per_guest_waste: {
    title: 'base.perGuest',
    onTarget: 'onTarget',
    negative: 'moreThanTarget',
    positive: 'lessThanTarget'
  },
  per_guest_avoidable: {
    title: 'avoidablePerGuest',
    onTarget: 'onStandard',
    negative: 'moreThanStandard',
    positive: 'lessThanStandard'
  },
  per_guest_saved: {
    title: 'savedPerGuest',
    onTarget: 'onBaseline',
    negative: 'moreThanBaseline',
    positive: 'lessThanBaseline'
  }
};

export const DEFAULT_DASHBOARD_METRIC_OPTIONS: {
  [id in DashboardMetricId]: DashboardMetricOptions;
} = {
  registration_frequency: {
    displayGauge: true
  },
  per_guest_waste: {
    as: 'g',
    displayGauge: true,
    indicator: GrowthIndicator
  },
  total_waste: {
    as: 'kg',
    displayGauge: true,
    indicator: GrowthIndicator
  },
  co2_waste: {
    as: 'ton',
    displayGauge: false,
    indicator: MealIndicator
  },
  per_guest_saved: {
    as: 'g',
    displayGauge: false,
    indicator: GrowthIndicator
  },
  per_guest_avoidable: {
    as: 'g',
    displayGauge: false,
    indicator: GrowthIndicator
  }
};

export function getStatusIntlKey(metric: StatusMetric): string {
  const { id, growth } = metric;
  const intlKeys = DASHBOARD_METRIC_INTL_KEYS[id];

  switch (growth) {
    case 'noTarget':
      return 'base.noTarget';
    case 'noData':
      return 'base.notEnoughData';
    case 'equal':
      return intlKeys.onTarget;
    case 'noTrend':
      return intlKeys.noTrend;
    case 'positive':
      return intlKeys.positive;
    case 'negative':
      return intlKeys.negative;
  }
}

export interface GaugeTrendColorOptions {
  growth: Growth;
  colors: { noData: string; negative: string; positive: string };
  max: number;
}

export function createTrendGaugeColorOptions(
  options: GaugeTrendColorOptions
): Partial<GaugeOptions> {
  const { growth, colors, max } = options;
  const { positive, negative, noData } = colors;

  const color = ['noData', 'noTarget'].includes(growth)
    ? noData
    : growth === 'negative'
    ? negative
    : positive;

  // to avoid gradient, set multiple stops of same color
  const gaugeColors = [
    { to: 0, color },
    { to: max / 2, color },
    { to: max, color }
  ];

  return {
    colors: gaugeColors
  };
}

export interface CreateGaugeOptions {
  colors: { positive: string; negative: string; noData: string };
  transformOptions?: TransformAmountOptions;
  formatOptions?: FormatNumberOptions;
}

export function createGaugeOptions(
  metric: StatusMetric,
  options: CreateGaugeOptions
): GaugeOptions {
  const { id, growth, target } = metric;
  const { colors, transformOptions, formatOptions } = options;
  const formatter = (value: number) => {
    const transformedAmount = transformOptions ? transformAmount(value, transformOptions) : value;
    return formatNumber(transformedAmount, formatOptions);
  };

  switch (id) {
    case 'registration_frequency': {
      const max = target.value;
      return {
        name: id,
        hideTick: true,
        max,
        tickFormatter: formatter,
        labelFormatter: () =>
          `<img width="32" height="32" src="${getFrequencyIcon(metric.growth)}"/>`,
        ...createTrendGaugeColorOptions({ max, growth, colors })
      };
    }
    case 'total_waste':
    case 'per_guest_waste':
    default: {
      const max = target.value * 2;
      return {
        name: id,
        max,
        tickFormatter: formatter,
        labelFormatter: formatter,
        ...createTrendGaugeColorOptions({ max, growth, colors })
      };
    }
  }
}

function getFrequencyIcon(growth: Growth): string {
  if (['noTarget', 'noData'].includes(growth)) {
    return confusedSmiley;
  }

  return growth === 'negative' ? sadSmiley : happySmiley;
}
