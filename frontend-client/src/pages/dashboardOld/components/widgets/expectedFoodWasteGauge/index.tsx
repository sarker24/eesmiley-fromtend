import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import getDefaultGaugeOptions, { getGaugeTitleConfig } from '../../../dashboardGaugeOptions';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import ExpectedFoodWasteSettings from './components/settings';
import { convertMassToViewValue, formatWeight } from 'utils/number-format';
import Widget from 'components/widget';
import ExpectedWeeklyWasteDetails from './components/details';
import DetailsDialog from '../../dashboardGauge/components/detailsDialog';
import SettingsIcon from '@material-ui/icons/Settings';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import ExpectedWeeklyWasteBarDetails from './components/barDetails';
import {
  ExpectedWeeklyWaste,
  selectProductSpecificExpectedWeeklyWaste,
  Waste
} from 'redux/ducks/dashboard';
import BarGauge from './components/barGauge';
import { Button } from '@material-ui/core';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { RootState } from 'redux/rootReducer';
import './index.scss';
import { ChartRef } from 'declarations/chart';

interface StateProps {
  waste: Waste;
  selectedProduct?: ExpectedWeeklyWaste;
  hasMultipleAccounts: boolean;
  shouldDisableDetailedView: boolean;
  editMode: boolean;
  isMenuOpen: boolean;
}

interface DispatchProps {
  selectProductSpecificExpectedWeeklyWaste: (point: RegistrationPoint, color: string) => void;
}

interface OwnProps {
  refreshing?: boolean;
}

interface IComponentState {
  productDetailsIsOpen: boolean;
  detailsIsOpen: boolean;
  mode: 'actual' | 'forecasted';
}

let interval;

type ExpectedFoodWasteGaugeProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class ExpectedFoodWasteGauge extends React.Component<ExpectedFoodWasteGaugeProps, IComponentState> {
  private readonly gaugeChart: React.RefObject<ChartRef>;

  constructor(props: ExpectedFoodWasteGaugeProps) {
    super(props);

    this.gaugeChart = React.createRef();

    this.state = {
      detailsIsOpen: false,
      productDetailsIsOpen: false,
      mode: 'actual'
    };
  }

  componentDidMount() {
    interval = setInterval(() => {
      this.setGaugeMode(
        this.state.mode == 'actual' && this.props.waste.forecastedAmount != undefined
          ? 'forecasted'
          : 'actual'
      );
    }, 5000);
  }

  componentWillUnmount() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  componentDidUpdate(prevProps: Readonly<ExpectedFoodWasteGaugeProps>) {
    if (prevProps.isMenuOpen !== this.props.isMenuOpen) {
      // when menu is opened, the content width changes while window width doesnt, thus need to manually recalculate widths
      // for charts
      this.gaugeChart.current && this.gaugeChart.current.chart.reflow();
    }
  }

  setGaugeMode = (mode: 'actual' | 'forecasted') => {
    const { waste } = this.props;
    if (waste.noSettings || this.gaugeChart.current == null) {
      return;
    }

    this.setState(
      {
        mode
      },
      () => {
        const options = this.getGaugeOptions();
        this.gaugeChart.current.chart.update(
          {
            series: options.series,
            pane: options.pane,
            title: options.title,
            yAxis: options.yAxis
          },
          true,
          true,
          true
        );
      }
    );
  };

  getGaugeOptions = (): Highcharts.Options => {
    const { intl, waste } = this.props;
    const amount = this.state.mode === 'actual' ? waste.actualAmount : waste.forecastedAmount;
    const value = convertMassToViewValue(amount);
    const tickPosition = convertMassToViewValue(waste.expectedAmount);

    const defaults = getDefaultGaugeOptions();
    const chartHeight =
      typeof defaults.chart.height == 'number'
        ? defaults.chart.height
        : parseInt(defaults.chart.height);
    const maxY = convertMassToViewValue(waste.expectedAmount) * 2;

    return {
      ...defaults,
      title: getGaugeTitleConfig(
        chartHeight,
        this.state.mode === 'actual'
          ? intl.messages['dashboard.improvements.actual']
          : intl.messages['forecasted']
      ),
      series: [
        {
          type: 'gauge',
          name: intl.messages['food_waste'],
          data: [Math.min(maxY, value)]
        } as Highcharts.SeriesGaugeOptions
      ],
      yAxis: {
        ...defaults.yAxis,
        tickColor: '#cbd5ea',
        tickPosition: 'outside',
        tickLength: 16,
        tickWidth: 2,
        max: maxY,
        tickPositioner: () => [tickPosition],
        labels: {
          ...(defaults.yAxis as Highcharts.YAxisOptions).labels,
          distance: 30,
          y: 4,
          x: 0,
          formatter: () =>
            '<span class="expectedWaste">' +
            intl.messages['expectedWaste'] +
            '<br/>' +
            formatWeight(Math.round(tickPosition), true) +
            '</span>'
        }
      },
      plotOptions: {
        gauge: {
          ...defaults.plotOptions.gauge,
          dataLabels: {
            ...defaults.plotOptions.gauge.dataLabels,
            formatter: function () {
              return formatWeight(value, true);
            },
            enabled: true
          }
        }
      },
      tooltip: {
        enabled: false
      }
    };
  };

  renderPlaceholder = () => {
    const { intl, refreshing } = this.props;
    if (refreshing) {
      return <LoadingPlaceholder />;
    } else {
      const placeholderDescription = intl.messages['dashboard.widgets.needToConfigure'].split('#');
      return (
        <div>
          <span>
            {intl.messages['dashboard.widgets.expectedWeeklyWasteGauge.currentlyUnavailable']}
          </span>
          <div className='placeholderDescription'>
            {placeholderDescription[0]}
            <SettingsIcon />
            {placeholderDescription[1]}
          </div>
        </div>
      );
    }
  };

  renderDetailedItemDialog = () => {
    if (this.props.selectedProduct) {
      return (
        <DetailsDialog
          title={this.props.intl.formatMessage(
            { id: 'dashboard.widgets.expectedWeeklyWaste.productDetails.headline' },
            { product: this.props.selectedProduct.name.toLowerCase() }
          )}
          onClose={() => {
            this.setState({ productDetailsIsOpen: false });
          }}
          open={this.state.productDetailsIsOpen}
        >
          <ExpectedWeeklyWasteBarDetails />
        </DetailsDialog>
      );
    } else {
      return;
    }
  };

  handleClick = (registrationPoint, color) => {
    // TODO fix this, selector no dispatch
    this.props.selectProductSpecificExpectedWeeklyWaste(registrationPoint, color);
    this.setState({ productDetailsIsOpen: true });
  };

  render() {
    const {
      waste,
      intl,
      editMode,
      hasMultipleAccounts,
      shouldDisableDetailedView,
      refreshing
    } = this.props;
    const { detailsIsOpen } = this.state;

    const gaugeOptions: Highcharts.Options = this.getGaugeOptions();
    const placeholder =
      (waste.noSettings || refreshing) && !editMode ? this.renderPlaceholder : null;

    return (
      <Widget
        editingTitle={intl.messages['dashboard.expectedFoodWaste.settings.title']}
        id={'expectedFoodWaste-gauge'}
        editFormComponent={ExpectedFoodWasteSettings}
        renderEmptyPlaceholder={placeholder}
        title={intl.messages['food_waste']}
        className={'gaugeContainer expectedFoodWasteGaugeContainer'}
      >
        <div className='expectWeeklyWasteInnerContainer'>
          <div className='expectWeeklyWasteInnerColumnContainer'>
            <HighchartsReact highcharts={Highcharts} options={gaugeOptions} ref={this.gaugeChart} />
            <Button
              className='detailedViewBtn'
              disabled={!hasMultipleAccounts || shouldDisableDetailedView}
              onClick={() => this.setState({ detailsIsOpen: true })}
            >
              {intl.messages['dashboard.widgets.detailedView']}
            </Button>
            {hasMultipleAccounts && (
              <DetailsDialog
                title={intl.messages['dashboard.widgets.expectedWeeklyWasteGauge.details.title']}
                onClose={() => this.setState({ detailsIsOpen: false })}
                open={detailsIsOpen}
              >
                <ExpectedWeeklyWasteDetails />
              </DetailsDialog>
            )}
            {this.renderDetailedItemDialog()}
          </div>
          <div className='expectWeeklyWasteInnerColumnContainer barChart'>
            <BarGauge handleClick={this.handleClick} />
          </div>
        </div>
      </Widget>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  waste: state.dashboard.data.foodWaste,
  selectedProduct: state.dashboard.data.foodWasteProduct,
  hasMultipleAccounts: state.dashboard.accounts && state.dashboard.accounts.length > 1,
  shouldDisableDetailedView:
    !state.dashboard.data.foodWaste.accounts || state.dashboard.data.foodWaste.accounts.length <= 1,
  editMode:
    state.widgets.editing['expectedFoodWaste-gauge'] != undefined
      ? state.widgets.editing['expectedFoodWaste-gauge']
      : false,
  isMenuOpen: state.ui.isMenuOpen
});

const mapDispatchToProps = {
  selectProductSpecificExpectedWeeklyWaste
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ExpectedFoodWasteGauge));
