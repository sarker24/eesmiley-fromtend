import * as React from 'react';
import ProductDetailsAccountTable from './components/productDetailsAccountTable';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { singleBarOptions } from 'pages/dashboardOld/dashboardGaugeOptions';
import { connect } from 'react-redux';
import { formatWeight, getPercentageOf } from 'utils/number-format';
import { ExpectedWeeklyWaste, Waste } from 'redux/ducks/dashboard';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { RootState } from 'redux/rootReducer';
import { Unit } from 'redux/ducks/settings';

interface StateProps {
  waste: Waste;
  registrationPoint: ExpectedWeeklyWaste;
  massUnit: Unit;
  registrationPointsMap: Map<string, RegistrationPoint>;
}

type ExpectedWeeklyWasteBarDetailsProps = StateProps & InjectedIntlProps;

class ExpectedWeeklyWasteBarDetails extends React.Component<
  ExpectedWeeklyWasteBarDetailsProps & InjectedIntlProps
> {
  render() {
    const { intl, registrationPoint, massUnit, waste } = this.props;
    const totalAmount = registrationPoint.totalPointAmountWasted;
    let maxValue =
      waste.forecastedAmount || waste.actualAmount > waste.forecastedAmount
        ? waste.actualAmount
        : waste.forecastedAmount;

    if (waste.expectedAmount > maxValue) {
      maxValue = waste.expectedAmount;
    }

    const options = singleBarOptions();
    options.series = [
      {
        type: 'bar',
        data: [
          {
            y: getPercentageOf(totalAmount, maxValue),
            x: 0,
            color: registrationPoint.color
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

    (options.xAxis as Highcharts.XAxisOptions).categories = [intl.messages['totalFoodWasteAmount']];

    // eslint-disable-next-line
    options.plotOptions.bar.dataLabels['formatter'] = function (): string {
      // eslint-disable-next-line
      return formatWeight(this.point.value, true);
    };

    options.yAxis['tickAmount'] = 100;
    options.yAxis['max'] = 100;
    options.chart['height'] = 50;
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
              {intl.formatMessage(
                { id: 'dashboard.widgets.expectedWeeklyWaste.productDetails.foodwastePerAccount' },
                { product: registrationPoint.name }
              )}
            </h4>
          </legend>
          <div>
            <ProductDetailsAccountTable
              data={registrationPoint.dataPerAccount}
              totalAmount={totalAmount}
              barColor={registrationPoint.color}
              valueUnit={massUnit}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    waste: state.dashboard.data.foodWaste,
    registrationPoint: state.dashboard.data.foodWasteProduct,
    massUnit: state.settings.unit,
    registrationPointsMap: state.data.registrationPoints.registrationPointsMap
  };
};

export default connect<StateProps, unknown, unknown>(mapStateToProps)(
  injectIntl(ExpectedWeeklyWasteBarDetails)
);
