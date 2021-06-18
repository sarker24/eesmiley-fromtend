import * as React from 'react';
import DetailsTable, { DetailAccount } from '../../../../dashboardGauge/components/detailsTable';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { singleBarOptions } from 'pages/dashboardOld/dashboardGaugeOptions';
import { connect } from 'react-redux';
import { convertMassToViewValue, formatWeight, getPercentageOf } from 'utils/number-format';
import moment from 'moment';
import { WasteAccount, WasteAccountTrend } from 'redux/ducks/dashboard';
import { RootState } from 'redux/rootReducer';
import { SeriesBarOptions } from 'highcharts';

type StateProps = ReturnType<typeof mapStateToProps>;

type ExpectedWeeklyWasteDetailsProps = StateProps & InjectedIntlProps;

class ExpectedWeeklyWasteDetails extends React.Component<ExpectedWeeklyWasteDetailsProps> {
  getTrendConfig = (account: WasteAccount) => {
    const { intl, interval } = this.props;
    const { trend: trends } = account;

    const mapTrend = (trend: WasteAccountTrend) => {
      let periodLabel = trend.periodLabel;

      if (interval == 'week') {
        periodLabel = intl.messages['report.filter_week'] + ' ' + trend.periodLabel;
      } else if (interval == 'month') {
        periodLabel = moment(trend.periodLabel).format('MMMM YYYY');
      }

      return {
        className:
          Number(trend.actualAmount) > Number(trend.expectedAmount) ? 'failure' : 'success',
        text: trend.actualAmount != undefined ? formatWeight(trend.actualAmount) : 'N/A',
        periodLabel: periodLabel
      };
    };

    return trends.map(mapTrend).reverse();
  };

  getDetailAccount = (account: WasteAccount): DetailAccount => ({
    ...account,
    color: Number(account.actualAmount) > Number(account.expectedAmount) ? '#41a1d3' : '#73c143',
    value: convertMassToViewValue(account.actualAmount),
    trendsOnTarget: 0
  });

  render() {
    const { intl, waste, massUnit } = this.props;

    const actualAmount = convertMassToViewValue(waste.actualAmount);
    const forecastedAmount =
      waste.forecastedAmount != undefined ? convertMassToViewValue(waste.forecastedAmount) : 0;
    const expectedAmount = convertMassToViewValue(waste.expectedAmount);
    let maxValue = actualAmount > forecastedAmount ? actualAmount : forecastedAmount;

    if (expectedAmount > maxValue) {
      maxValue = expectedAmount;
    }

    const options = singleBarOptions();
    options.series = [
      {
        type: 'bar',
        data: [
          {
            y: getPercentageOf(actualAmount, maxValue),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            value: actualAmount,
            x: 0,
            color: actualAmount <= expectedAmount ? '#73c143' : '#41a1d3'
          }
        ],
        minPointLength: 3,
        states: {
          hover: {
            enabled: false
          }
        }
      }
    ];

    if (waste.forecastedAmount != undefined && Number(waste.forecastedAmount) >= 0) {
      (options.series[0] as SeriesBarOptions).data.push({
        y: getPercentageOf(forecastedAmount, maxValue),
        x: 1,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        value: forecastedAmount,
        color: forecastedAmount <= expectedAmount ? '#73c143' : '#41a1d3'
      });
    }

    (options.xAxis as Highcharts.XAxisOptions).categories = [
      intl.messages['dashboard.widgets.expectedWeeklyWasteGauge.details.totalActual'],
      intl.messages['dashboard.widgets.expectedWeeklyWasteGauge.details.totalForecasted']
    ];

    // eslint-disable-next-line
    options.plotOptions.bar.dataLabels['formatter'] = function () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return formatWeight(this.point.value, true);
    };

    options.yAxis['tickAmount'] = 100;
    options.yAxis['max'] = 100;
    options.chart['height'] = 50 * (options.series[0] as SeriesBarOptions).data.length;
    // eslint-disable-next-line
    options.plotOptions.bar.dataLabels['crop'] = false;
    // eslint-disable-next-line
    options.plotOptions.bar.dataLabels['overflow'] = 'none';

    return (
      <div className='expectedWeeklyWasteDetails'>
        <div className='bars'>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
        <div className='container expectedWeeklyWasteDetails detailsTableContainer'>
          <legend className='containerHeader'>
            <h4 className='containerTitle'>
              {intl.messages['dashboard.widgets.expectedWeeklyWasteGauge.details.perAccount']}
            </h4>
          </legend>
          <div className='detailsTableWrapper'>
            <DetailsTable
              getTrendConfig={this.getTrendConfig}
              data={waste.accounts.map(this.getDetailAccount)}
              formatter={(value: number) => {
                return formatWeight(value, true);
              }}
              valueUnit={intl.messages['weight'] + ' (' + massUnit + ')'}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  waste: state.dashboard.data.foodWaste,
  interval: state.dashboard.filter.interval,
  massUnit: state.settings.unit
});

export default connect<StateProps, unknown, unknown>(mapStateToProps)(
  injectIntl(ExpectedWeeklyWasteDetails)
);
