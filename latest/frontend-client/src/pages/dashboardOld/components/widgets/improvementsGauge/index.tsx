import * as React from 'react';
import DashboardGauge from '../../dashboardGauge';
import getDefaultGaugeOptions, { getGaugeTitleConfig } from '../../../dashboardGaugeOptions';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { formatMoney } from 'utils/number-format';
import ImprovementsDetails from './components/details';
import { RootState } from 'redux/rootReducer';
import { ImprovementMissingDataAccount } from 'redux/ducks/dashboard';
import { ChartRef } from 'declarations/chart';

type StateProps = ReturnType<typeof mapStateToProps>;

interface IComponentState {
  mode: 'actual' | 'forecasted';
}

let interval;

type ImprovementsGaugeProps = StateProps & InjectedIntlProps;

class ImprovementsGauge extends React.Component<ImprovementsGaugeProps, IComponentState> {
  private chart: React.RefObject<ChartRef>;
  private readonly minimumPercentageOfRegistrations: number = 70;

  constructor(props: ImprovementsGaugeProps) {
    super(props);
    this.chart = React.createRef();
    this.state = {
      mode: 'actual'
    };
  }

  setGaugeMode = (mode: 'actual' | 'forecasted') => {
    const { data, intl } = this.props;
    if (data.noSettings || !this.chart.current) {
      return;
    }

    this.setState(
      {
        mode
      },
      () => {
        this.chart.current.chart.update(
          {
            title: {
              text:
                this.state.mode === 'actual'
                  ? intl.messages['dashboard.improvements.actual']
                  : intl.messages['forecasted']
            },
            series: [
              {
                type: 'gauge',
                name: intl.messages['dashboard.improvements.title'],
                data: [
                  {
                    y:
                      this.state.mode == 'actual'
                        ? formatMoney(data.improvementCost).value
                        : formatMoney(data.forecastedCost).value
                  }
                ]
              }
            ]
          },
          true,
          true,
          true
        );
      }
    );
  };

  shouldComponentUpdate(nextProps: ImprovementsGaugeProps, nextState: IComponentState) {
    return this.state.mode === nextState.mode;
  }

  componentDidMount() {
    interval = setInterval(() => {
      this.setGaugeMode(
        this.state.mode == 'actual' && this.props.data.forecastedCost != undefined
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

  getAccountsWithoutRegString = (accounts: ImprovementMissingDataAccount[]): React.ReactNode => {
    const { intl, currentCustomerId, currentCustomerName, selectedAccounts } = this.props;
    const allAccounts: ImprovementMissingDataAccount[] = [];
    accounts.map((account) => {
      if (account.id === String(currentCustomerId)) {
        allAccounts.push({ id: account.id, name: currentCustomerName });
      } else {
        allAccounts.push(account);
      }
    });

    if (allAccounts.length === 1 && selectedAccounts.length <= 1) {
      if (accounts[0].id === String(currentCustomerId)) {
        return intl.formatMessage(
          { id: 'dashboard.widgets.improvementsGauge.currentAccountHasInsufficientRegistrations' },
          { percentage: this.minimumPercentageOfRegistrations }
        );
      } else {
        return intl.formatMessage(
          { id: 'dashboard.widgets.improvementsGauge.selectedAccountHasInsufficientRegistrations' },
          { percentage: this.minimumPercentageOfRegistrations }
        );
      }
    }

    const len = allAccounts.length;

    return (
      <div>
        {intl.formatMessage(
          { id: 'dashboard.widgets.improvementsGauge.accountsHasInsufficientRegistrations' },
          { percentage: this.minimumPercentageOfRegistrations }
        )}
        &nbsp;
        {allAccounts.map((account, index: number) => {
          return (
            <span
              key={index}
              className='normal'
              title={`${intl.messages['auth.login_deal_number']}: ${account.id}`}
            >
              {account.name}
              {index == len - 1 ? '' : index == len - 2 ? ' ' + intl.messages['and'] + ' ' : ', '}
            </span>
          );
        })}
        .
        <br />
        <br />
        {
          intl.messages[
            'dashboard.widgets.improvementGauge.improvementsCanNotBeDisplayedDueToInsufficientRegistrations'
          ]
        }
      </div>
    );
  };

  getAccountsWithoutProdString = (accounts: ImprovementMissingDataAccount[]): React.ReactNode => {
    const { intl, currentCustomerId, currentCustomerName, selectedAccounts } = this.props;
    const allAccounts: ImprovementMissingDataAccount[] = [];
    accounts.map((account) => {
      if (account.id === String(currentCustomerId)) {
        allAccounts.push({ id: account.id, name: currentCustomerName });
      } else {
        allAccounts.push(account);
      }
    });

    if (allAccounts.length === 1 && selectedAccounts.length <= 1) {
      return intl.messages['dashboard.widgets.improvementsGauge.selectedAccountHasNoProducts'];
    }

    const len = allAccounts.length;

    return (
      <div>
        {intl.messages[
          'dashboard.widgets.improvementsGauge.improvementsCanNotBeDisplayedDueToNoProducts'
        ] +
          ' ' +
          `${intl.messages['dashboard.widgets.improvementsGauge.accountsWithoutProducts']}${intl.messages['colon']}`}
        &nbsp;
        {allAccounts.map((account, index: number) => {
          return (
            <span
              key={index}
              className='normal'
              title={intl.messages['auth.login_deal_number'] + ': ' + account.id}
            >
              {account.name}
              {index == len - 1 ? '' : index == len - 2 ? ' ' + intl.messages['and'] + ' ' : ', '}
            </span>
          );
        })}
        .
      </div>
    );
  };

  renderEmptyPlaceholder = () => {
    const { data, intl } = this.props;
    if (!data.accounts || data.accounts.length === 0) {
      return (
        <div>
          <span>{intl.messages['dashboard.widgets.improvementsGauge.currentlyUnavailable']}</span>
          <div className='placeholderDescription'>
            {
              intl.messages[
                'dashboard.widgets.improvementsGauge.accountsMissingExpectedWeeklyWasteSettings'
              ]
            }
          </div>
        </div>
      );
    } else if (data.accountsWithoutEnoughRegs && data.accountsWithoutEnoughRegs.length > 0) {
      return (
        <div>
          <span>{intl.messages['dashboard.widgets.improvementsGauge.currentlyUnavailable']}</span>
          <div className='placeholderDescription'>
            {this.getAccountsWithoutRegString(data.accountsWithoutEnoughRegs)}
          </div>
        </div>
      );
    } else if (
      data.accountsWithoutRegistrationPoints &&
      data.accountsWithoutRegistrationPoints.length > 0
    ) {
      return (
        <div>
          <span>{intl.messages['dashboard.widgets.improvementsGauge.currentlyUnavailable']}</span>
          <div className='placeholderDescription'>
            {this.getAccountsWithoutProdString(data.accountsWithoutRegistrationPoints)}
          </div>
        </div>
      );
    }
  };

  render() {
    const { data, intl } = this.props;
    const options = getDefaultGaugeOptions();
    options.yAxis['max'] = formatMoney(data.maxCost).value;
    options.yAxis['min'] = 0;
    options['title'] = getGaugeTitleConfig(
      options.chart.height as number,
      this.state.mode === 'actual'
        ? intl.messages['dashboard.improvements.actual']
        : intl.messages['forecasted']
    );
    options.plotOptions.gauge.dataLabels['enabled'] = true;
    options.tooltip = { enabled: false };
    options.pane.background['backgroundColor'] = {
      linearGradient: { x1: 0, y1: 1, x2: 1, y2: 1 },
      stops: [
        [0, '#41a1d3'],
        [1, '#7dbf46']
      ]
    };
    options.plotOptions.gauge.dataLabels['formatter'] = function () {
      // eslint-disable-next-line
      return formatMoney(parseInt(this.y), { inMajorUnit: true }).toString();
    };

    options.series = [
      {
        type: 'gauge',
        name: intl.messages['dashboard.improvements.title'],
        data: [
          this.state.mode == 'forecasted'
            ? formatMoney(data.forecastedCost).value
            : formatMoney(data.improvementCost).value
        ]
      }
    ];

    const details = {
      title: intl.messages['dashboard.widgets.improvementsGauge.details.title'],
      render: () => {
        return <ImprovementsDetails />;
      }
    };

    return (
      <DashboardGauge
        id='improvements-gauge'
        className='improvementsGaugeContainer'
        renderEmptyPlaceholder={this.renderEmptyPlaceholder}
        shouldDisableDetailedView={!data.accounts || data.accounts.length <= 1}
        details={details}
        title={intl.messages['dashboard.improvements.title']}
        options={options}
      />
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  data: state.dashboard.data.improvements,
  currentCustomerName: state.user.customerName,
  currentCustomerId: state.user.customerId,
  selectedAccounts: state.dashboard.accounts
});

export default connect<StateProps, unknown, unknown>(mapStateToProps)(
  injectIntl(ImprovementsGauge)
);
