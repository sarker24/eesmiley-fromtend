import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import DateIntervalSelector from './components/dateIntervalSelector';
import AccountSelector from './components/accountSelector';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import GuidingStep from 'components/guidingStep';
import { Button } from '@material-ui/core';

import './index.scss';
import { TimeFilterShape } from 'utils/types';

export type DateFilter = {
  startDate: string;
  endDate: string;
  interval: string;
  timeFilter?: string;
};

export type FilterValue = {
  dateFilter: DateFilter;
  accountIds: string[];
};

interface OwnProps {
  accountSelectorEnabled?: boolean;
  weeksEnabled?: boolean;
  resetFilterButtonEnabled?: boolean;
  monthsEnabled?: boolean;
  yearsEnabled?: boolean;
  daysEnabled?: boolean;
  onChange?: (value: FilterValue) => void;
  value?: FilterValue;
  showGuidingSteps?: boolean;
  canSelectMultipleAccounts?: boolean;
  renderAccountSelectorComponent?: (
    accountIds: string[],
    onChange: (accountIds: string[]) => void
  ) => JSX.Element;
  requireAccountSettings?: boolean;
}

interface FilterControllerState {
  accountIds: string[];
  dateFilter: DateFilter;
}

type FilterControllerProps = OwnProps & InjectedIntlProps;

/**
 * Depracated - do not use
 */
class FilterController extends React.Component<FilterControllerProps, FilterControllerState> {
  static defaultProps = {
    weeksEnabled: true,
    monthsEnabled: true,
    resetFilterButtonEnabled: false,
    yearsEnabled: true,
    requireAccountSettings: true,
    daysEnabled: true,
    dateSelectorType: undefined,
    showGuidingSteps: false,
    canSelectMultipleAccounts: true
  };

  constructor(props: FilterControllerProps) {
    super(props);

    this.state = {
      dateFilter: props?.value.dateFilter || {
        startDate: '',
        endDate: '',
        interval: ''
      },
      accountIds: props?.value.accountIds || []
    };
  }

  componentDidMount() {
    this.updatePeriodOptions(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps: FilterControllerProps) {
    if (
      this.props.weeksEnabled != nextProps.weeksEnabled ||
      this.props.monthsEnabled != nextProps.monthsEnabled ||
      this.props.yearsEnabled != nextProps.yearsEnabled ||
      this.props.daysEnabled != nextProps.daysEnabled
    ) {
      this.updatePeriodOptions(nextProps);
    }
  }

  updatePeriodOptions = (props: FilterControllerProps): void => {
    const { weeksEnabled, monthsEnabled, yearsEnabled } = props;

    if (this.props.value) {
      this.setState(this.props.value);
      return;
    } else {
      let dateFilter: DateFilter;
      const now = moment().utc();
      if (weeksEnabled) {
        dateFilter = {
          startDate: now.startOf('isoWeek').format('YYYY-MM-DD'),
          endDate: now.format('YYYY-MM-DD'),
          interval: 'week',
          timeFilter: `${now.startOf('isoWeek').isoWeekYear()}.${now
            .startOf('isoWeek')
            .isoWeek()}.${now.startOf('isoWeek').format('DDD')}` as TimeFilterShape
        };
      } else if (monthsEnabled) {
        dateFilter = {
          startDate: now.startOf('month').format('YYYY-MM-DD'),
          endDate: now.format('YYYY-MM-DD'),
          interval: 'month',
          timeFilter: `${now.format('YYYY')}.${parseInt(now.format('M')) - 1}` as TimeFilterShape
        };
      } else if (yearsEnabled) {
        dateFilter = {
          startDate: now.startOf('year').format('YYYY-MM-DD'),
          endDate: now.format('YYYY-MM-DD'),
          interval: 'week',
          timeFilter: `${now.format('YYYY')}` as TimeFilterShape
        };
      }

      this.setState({ dateFilter, accountIds: [] });
    }
  };

  onChangeAccounts = (accountIds: string[]): void => {
    this.setState(
      {
        accountIds
      },
      () => {
        if (this.props.onChange) {
          setTimeout(() => {
            this.props.onChange(this.state);
          }, 100);
        }
      }
    );
  };

  onChangeDateFilter = (dateFilter: DateFilter): void => {
    const { onChange } = this.props;
    this.setState({ dateFilter }, () => {
      if (onChange) {
        setTimeout(() => {
          onChange(this.state);
        }, 100);
      }
    });
  };

  onResetFilter = (): void => {
    const { onChange } = this.props;
    this.setState(
      {
        ...this.state,
        accountIds: []
      },
      () => {
        if (onChange) {
          setTimeout(() => {
            onChange(this.state);
          }, 100);
        }
      }
    );
  };

  render() {
    const {
      intl,
      renderAccountSelectorComponent,
      showGuidingSteps,
      canSelectMultipleAccounts,
      accountSelectorEnabled,
      resetFilterButtonEnabled,
      weeksEnabled,
      yearsEnabled,
      monthsEnabled,
      requireAccountSettings
    } = this.props;
    const { accountIds, dateFilter } = this.state;

    let accountSelector = null;

    const dateSelector = (
      <DateIntervalSelector
        weeksEnabled={weeksEnabled}
        yearsEnabled={yearsEnabled}
        monthsEnabled={monthsEnabled}
        onChange={this.onChangeDateFilter}
        value={dateFilter}
      />
    );

    if (accountSelectorEnabled) {
      accountSelector = renderAccountSelectorComponent ? (
        renderAccountSelectorComponent(accountIds, this.onChangeAccounts)
      ) : (
        <AccountSelector
          multiple={canSelectMultipleAccounts}
          requireAccountSettings={requireAccountSettings}
          onChange={this.onChangeAccounts}
          value={accountIds}
        />
      );
    }

    return (
      <div className='filterController interval'>
        {dateSelector}
        {accountSelectorEnabled && (
          <div className={'filterControllerExtraFiltersContainer'}>
            <div className='filterControllerColumn'>
              {showGuidingSteps && (
                <GuidingStep text={'3'}>
                  3. {intl.messages['help.report.filterController.accounts']}
                </GuidingStep>
              )}
              {accountSelector}
              {resetFilterButtonEnabled && (
                <Button
                  className={'filterControllerResetBtn'}
                  startIcon={<ClearIcon />}
                  disabled={accountIds.length == 0}
                  onClick={this.onResetFilter}
                >
                  {intl.messages['report.filter_reset']}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default injectIntl(FilterController);
