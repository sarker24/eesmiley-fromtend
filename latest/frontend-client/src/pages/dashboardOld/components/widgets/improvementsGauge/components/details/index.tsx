import * as React from 'react';
import DetailsTable, { DetailAccount } from '../../../../dashboardGauge/components/detailsTable';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { singleBarOptions } from 'pages/dashboardOld/dashboardGaugeOptions';
import { connect } from 'react-redux';
import { formatMoney, getPercentageOf } from 'utils/number-format';
import moment from 'moment';
import { RootState } from 'redux/rootReducer';
import { ImprovementAccount, ImprovementAccountTrend } from 'redux/ducks/dashboard';
import { SeriesBarOptions } from 'highcharts';

type StateProps = ReturnType<typeof mapStateToProps>;

type ImprovementsDetailsProps = StateProps & InjectedIntlProps;

class ImprovementsDetails extends React.Component<ImprovementsDetailsProps> {
  getTrendConfig = (account: ImprovementAccount) => {
    const { intl, interval } = this.props;

    const mapTrend = (trend: ImprovementAccountTrend) => {
      let periodLabel = trend.periodLabel;

      if (interval == 'week') {
        periodLabel = intl.messages['report.filter_week'] + ' ' + trend.periodLabel;
      } else if (interval == 'month') {
        periodLabel = moment(trend.periodLabel).format('MMMM YYYY');
      }

      const improvementCost = Number(trend.improvementCost);
      return {
        className: improvementCost > Number(trend.maxCost) * 0.5 ? 'success' : 'improvement',
        text: formatMoney(trend.improvementCost >= 0 ? trend.improvementCost : 0).toString(),
        periodLabel: periodLabel
      };
    };

    return account.trend.map(mapTrend).reverse();
  };

  getDetailAccount = (account: ImprovementAccount): DetailAccount => ({
    ...account,
    color:
      Number(
        account.forecastedCost != undefined ? account.forecastedCost : account.improvementCost
      ) >
      Number(account.maxCost) * 0.5
        ? '#73c143'
        : '#49a3d2',
    value: formatMoney(
      account.forecastedCost != undefined ? account.forecastedCost : account.improvementCost
    ).value,
    trendsOnTarget: 0
  });

  render() {
    const { intl, data, currency } = this.props;
    const improvementCost = formatMoney(data.improvementCost).value;
    const maxCost = formatMoney(data.maxCost).value;

    const options = singleBarOptions();
    options.series = [
      {
        type: 'bar',
        data: [
          {
            y: getPercentageOf(improvementCost, maxCost),
            //value: improvementCost,
            x: 0,
            color: improvementCost > maxCost * 0.5 ? '#73c143' : '#49a3d2'
          }
        ],
        states: {
          hover: {
            enabled: false
          }
        }
      }
    ];

    options.chart['height'] = 50;

    if (data.forecastedCost) {
      const forecastedCost = formatMoney(data.forecastedCost).value;
      (options.series[0] as SeriesBarOptions).data.push({
        y: getPercentageOf(forecastedCost, maxCost),
        x: 1,
        //value: forecastedCost,
        color: forecastedCost > maxCost * 0.5 ? '#73c143' : '#49a3d2'
      });
      options.chart['height'] = 100;
    }

    (options.xAxis as Highcharts.XAxisOptions).categories = [
      intl.messages['dashboard.widgets.expectedWeeklyWasteGauge.details.totalActual'],
      intl.messages['dashboard.widgets.expectedWeeklyWasteGauge.details.totalForecasted']
    ];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    options.plotOptions.bar.dataLabels['formatter'] = function () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return formatMoney(this.point.value, { inMajorUnit: true }).toString();
    };

    options.yAxis['tickAmount'] = 100;
    options.yAxis['max'] = 100;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    options.plotOptions.bar.dataLabels['crop'] = false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    options.plotOptions.bar.dataLabels['overflow'] = 'none';

    return (
      <div className='improvementsDetails'>
        <div className='bars'>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
        <div className='container improvementsDetails detailsTableContainer'>
          <legend className='containerHeader'>
            <h4 className='containerTitle'>
              {intl.messages['dashboard.widgets.improvementsGauge.details.perAccount']}
            </h4>
          </legend>
          <div className='detailsTableWrapper'>
            <DetailsTable
              getTrendConfig={this.getTrendConfig}
              data={data.accounts}
              formatter={(value: number) => {
                return formatMoney(value, { inMajorUnit: true }).toString();
              }}
              valueUnit={intl.messages['cost'] + ' (' + currency + ')'}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  data: state.dashboard.data.improvements,
  interval: state.dashboard.filter.interval,
  currency: state.settings.currency
});

export default connect<StateProps, unknown, unknown>(mapStateToProps)(
  injectIntl(ImprovementsDetails)
);
