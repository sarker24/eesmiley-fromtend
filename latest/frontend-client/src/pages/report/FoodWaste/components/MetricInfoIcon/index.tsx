import * as React from 'react';
import { calculateMetricTimeRange } from 'report/FoodWaste/components/MetricInfoIcon/util';
import { Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RootState } from 'redux/rootReducer';

type StateProps = ReturnType<typeof mapStateToProps>;
type MetricInfoIconProps = StateProps & InjectedIntlProps;

const MetricInfoIcon: React.FunctionComponent<MetricInfoIconProps> = (props) => {
  const { from, to } = calculateMetricTimeRange(props);
  const classes = useStyles(props);
  const { intl } = props;

  return (
    <Tooltip
      title={<span>{intl.formatMessage({ id: 'report.metricFromPeriods' }, { from, to })}</span>}
    >
      <InfoIcon className={classes.infoIcon} />
    </Tooltip>
  );
};

const useStyles = makeStyles({
  infoIcon: {
    width: '20px',
    height: '20px',
    color: 'rgba(0,0,0,0.2)'
  }
});

const mapStateToProps = (state: RootState) => ({
  period: state.newReports.period,
  timeRange: state.newReports.timeRange
});

export default connect<StateProps, unknown, unknown>(mapStateToProps)(injectIntl(MetricInfoIcon));
