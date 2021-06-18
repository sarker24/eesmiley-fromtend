import * as React from 'react';
import FrequencySettings from './components/settings';
import DashboardGauge from '../../dashboardGauge';
import getDefaultGaugeOptions from '../../../dashboardGaugeOptions';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import FrequencyDetails from './components/details';
import SettingsIcon from '@material-ui/icons/Settings';
import { RootState } from 'redux/rootReducer';
import './index.scss';

type StateProps = ReturnType<typeof mapStateToProps>;

type FrequencyPageProps = StateProps & InjectedIntlProps;

class FrequencyGauge extends React.Component<FrequencyPageProps> {
  constructor(props: FrequencyPageProps) {
    super(props);
  }

  renderPlaceholder = () => {
    const { intl } = this.props;
    const placeholderDescription = intl.messages['dashboard.widgets.needToConfigure'].split('#');
    return (
      <div>
        <span>{intl.messages['dashboard.widgets.frequencyGauge.currentlyUnavailable']}</span>
        <div className='placeholderDescription'>
          {placeholderDescription[0]}
          <SettingsIcon />
          {placeholderDescription[1]}
        </div>
      </div>
    );
  };

  render() {
    const { data, intl, editMode } = this.props;
    const options = getDefaultGaugeOptions();
    options.yAxis['max'] = 200;
    options.yAxis['min'] = 0;
    options.yAxis['labels'] = { enabled: false };

    options['series'] = [
      {
        type: 'gauge',
        name: intl.messages['benchmarks.frequencyRegistrations'],
        data: [data.onTarget ? 150 : data.pointerLocation]
      } as Highcharts.SeriesGaugeOptions
    ];

    options.tooltip = {
      enabled: false
    };

    const details = {
      title: intl.messages['dashboard.widgets.frequencyGauge.details.title'],
      render: () => {
        return <FrequencyDetails />;
      }
    };
    const placeholder = data.noSettings && !editMode ? this.renderPlaceholder : null;

    return (
      <DashboardGauge
        hasPopover={true}
        popoverText={
          data.onTarget
            ? intl.messages['dashboard.gauges.goodJob']
            : intl.messages['dashboard.gauges.badJob']
        }
        id='frequency-gauge'
        shouldDisableDetailedView={!data.accounts || data.accounts.length <= 1}
        renderEmptyPlaceholder={placeholder}
        className='frequencyGaugeContainer'
        details={details}
        title={intl.messages['benchmarks.frequencyRegistrations']}
        options={options}
        editFormComponent={FrequencySettings}
      />
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  data: state.dashboard.data.frequency,
  editMode:
    state.widgets.editing['frequency-gauge'] != undefined
      ? state.widgets.editing['frequency-gauge']
      : false
});

export default connect<StateProps, unknown, unknown>(mapStateToProps)(injectIntl(FrequencyGauge));
