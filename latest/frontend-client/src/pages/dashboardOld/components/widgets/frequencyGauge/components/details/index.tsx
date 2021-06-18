import * as React from 'react';
import DetailsTable, { DetailAccount } from '../../../../dashboardGauge/components/detailsTable';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { singleBarOptions } from 'pages/dashboardOld/dashboardGaugeOptions';
import { connect } from 'react-redux';
import moment from 'moment';
import { RootState } from 'redux/rootReducer';
import { FrequencyAccount, FrequencyTrend } from 'redux/ducks/dashboard';

type StateProps = ReturnType<typeof mapStateToProps>;

type FrequencyDetailsProps = StateProps & InjectedIntlProps;

class FrequencyDetails extends React.Component<FrequencyDetailsProps> {
  getTrendConfig = (account: FrequencyAccount) => {
    const { intl, interval } = this.props;

    const mapTrend = (trend: FrequencyTrend) => {
      let periodLabel = trend.periodLabel;

      if (interval == 'week') {
        periodLabel = intl.messages['report.filter_week'] + ' ' + trend.periodLabel;
      } else if (interval == 'month') {
        periodLabel = moment(trend.periodLabel).format('MMMM-YYYY');
      }

      return {
        className: trend.onTarget ? 'success' : 'failure',
        text:
          trend.percentage != undefined && trend.onTarget === false
            ? intl.formatNumber(trend.percentage) + '%'
            : intl.messages['onTarget'],
        periodLabel: periodLabel
      };
    };

    return account.trend.map(mapTrend).reverse();
  };

  getDetailAccount = (account: FrequencyAccount): DetailAccount => ({
    ...account,
    color: account.onTarget ? '#73c143' : '#41a1d3',
    value: account.frequency,
    trendsOnTarget: account.trend.filter((trend) => trend.onTarget).length
  });

  render() {
    const { intl, data } = this.props;

    const options = singleBarOptions();
    options.series = [
      {
        type: 'bar',
        data: [
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            value: data.pointerLocation,
            y: (data.pointerLocation / 150) * 100
          }
        ],
        states: {
          hover: {
            enabled: false
          }
        }
      }
    ];
    (options.xAxis as Highcharts.XAxisOptions).categories = [
      intl.messages['report.registration_list.total']
    ];
    // eslint-disable-next-line
    options.plotOptions.bar.dataLabels['formatter'] = function () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return intl.formatNumber(Math.round((this.point.value / 150) * 100)) + '%';
    };
    options.chart['height'] = 50;
    options.yAxis['tickAmount'] = 100;
    options.yAxis['max'] = 100;
    // eslint-disable-next-line
    options.plotOptions.bar.dataLabels['crop'] = false;
    // eslint-disable-next-line
    options.plotOptions.bar.dataLabels['overflow'] = 'none';
    options['colors'] = [data.onTarget ? '#73c143' : '#41a1d3'];

    return (
      <div className='frequencyDetails'>
        <div className='bars'>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
        <div className='container frequencyDetails detailsTableContainer'>
          <legend className='containerHeader'>
            <h4 className='containerTitle'>
              {intl.messages['dashboard.widgets.frequencyGauge.details.perAccount']}
            </h4>
          </legend>
          <div className='detailsTableWrapper'>
            <DetailsTable
              getTrendConfig={this.getTrendConfig}
              data={data.accounts.map(this.getDetailAccount)}
              formatter={(value: number) =>
                intl.formatNumber(Math.round((value / 150) * 100)) + '%'
              }
              valueUnit={
                intl.messages['dashboard.widgets.frequencyGauge.details.frequency'] + ' (%)'
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  data: state.dashboard.data.frequency,
  interval: state.dashboard.filter.interval
});

export default connect<StateProps, unknown, unknown>(mapStateToProps)(injectIntl(FrequencyDetails));
