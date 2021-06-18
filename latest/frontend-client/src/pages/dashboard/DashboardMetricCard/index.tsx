import * as React from 'react';
import withLoading, { WithLoadingProps } from 'LoadingPlaceholder/withLoading';

import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { formatNumber, FormatNumberOptions, MassUnit, transformAmount } from 'utils/number-format';
import { useTheme } from '@material-ui/core';
import MetricCard from 'metrics/MetricCard';
import {
  createGaugeOptions,
  DASHBOARD_METRIC_INTL_KEYS,
  DASHBOARD_VIEW_MORE_LINKS,
  DEFAULT_DASHBOARD_METRIC_OPTIONS,
  getStatusIntlKey
} from './util';
import Gauge from 'metrics/Gauge';
import StatusBar from 'metrics/StatusBar';
import StatusBarContent, { StatusBarValue } from 'metrics/StatusBarContent';
import { StatusMetric } from 'redux/ducks/dashboardNext';
import { setActiveStep } from 'redux/ducks/tutorials';
import { connect } from 'react-redux';
import registrationHelp from 'dashboard/DashboardMetricCard/registrationHelp';
import targetHelp from 'dashboard/DashboardMetricCard/targetHelp';
import { HelpContent } from 'redux/ducks/tutorials/types';

export * from './util';

export type DashboardFormatOptions = Omit<FormatNumberOptions, 'unit' | 'unitSpace'>;
type DispatchProps = typeof mapDispatchToProps;

export interface DashboardMetricCardProps extends WithLoadingProps {
  className?: string;
  metric: StatusMetric;
  hideViewMore?: boolean;
  statusFormatOptions?: DashboardFormatOptions;
  valueFormatOptions?: DashboardFormatOptions;
}

type OwnProps = DispatchProps & DashboardMetricCardProps;

const defaultValueFormatOptions: DashboardFormatOptions = {
  displayUnit: true,
  precision: 0,
  rounding: 'round'
};

const defaultStatusFormatOptions: DashboardFormatOptions = {
  displayUnit: true,
  precision: 0,
  signDisplay: 'never',
  rounding: 'round'
};

const helpSettings: {
  [key: string]: HelpContent & { tutorialId: string };
} = {
  noTarget: {
    tutorialId: 'tutorial-targets',
    ...targetHelp
  },
  noData: {
    tutorialId: 'tutorial-registrations',
    ...registrationHelp
  }
};

const DashboardMetricCard: React.FunctionComponent<OwnProps> = (props) => {
  const theme = useTheme();
  const {
    palette: { success, error, grey }
  } = theme;
  const {
    metric,
    hideViewMore,
    valueFormatOptions = defaultValueFormatOptions,
    statusFormatOptions = defaultStatusFormatOptions,
    className,
    setActiveStep
  } = props;
  const { id, point, target, status } = metric;

  const metricOptions = DEFAULT_DASHBOARD_METRIC_OPTIONS[id];
  const intlKeys = DASHBOARD_METRIC_INTL_KEYS[id];
  const viewMoreLink = hideViewMore ? undefined : DASHBOARD_VIEW_MORE_LINKS[id];
  const { displayGauge, indicator: Indicator, as } = metricOptions;
  const transformOptions = as ? { unit: point.unit, as } : undefined;
  const viewUnit = as || (point.unit as MassUnit);

  const handleHelp = (metric: StatusMetric) => () => {
    setActiveStep({
      ...helpSettings[metric.growth],
      step: 1
    });
  };

  return (
    <MetricCard
      className={className}
      chart={
        displayGauge && (
          <Gauge
            point={point.value}
            target={target.value}
            options={createGaugeOptions(metric, {
              colors: { positive: success.light, negative: error.light, noData: grey.A100 },
              transformOptions,
              formatOptions: {
                ...valueFormatOptions,
                unit: viewUnit,
                unitSpace: !!viewUnit
              }
            })}
          />
        )
      }
      value={formatNumber(transformAmount(point.value, transformOptions), {
        ...valueFormatOptions,
        unit: viewUnit,
        unitSpace: !!viewUnit
      })}
      title={<FormattedHTMLMessage id={intlKeys.title} />}
      isLoading={false}
    >
      <StatusBar growth={metric.growth} viewMore={viewMoreLink} onHelp={handleHelp(metric)}>
        <StatusBarContent
          indicator={Indicator && <Indicator value={status.value} growth={metric.growth} />}
        >
          <FormattedMessage
            id={getStatusIntlKey(metric)}
            values={{
              value: (
                <StatusBarValue>
                  {formatNumber(status.value, {
                    ...statusFormatOptions,
                    unit: status.unit
                  })}
                </StatusBarValue>
              )
            }}
          />
        </StatusBarContent>
      </StatusBar>
    </MetricCard>
  );
};

const mapDispatchToProps = { setActiveStep };

export default connect<unknown, DispatchProps, DashboardMetricCardProps>(
  null,
  mapDispatchToProps
)(withLoading(DashboardMetricCard));
