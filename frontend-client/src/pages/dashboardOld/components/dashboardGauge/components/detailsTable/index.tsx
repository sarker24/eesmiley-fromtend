import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Table, TableBody, TableCell, TableHead, TableRow, Popover } from '@material-ui/core';
import HeaderCell from 'components/table/HeaderCell';
import { CSSTransitionGroup } from 'react-transition-group';
import TrendBar from './components/trendBar';
import { connect } from 'react-redux';
import moment from 'moment';
import './index.scss';
import { RootState } from 'redux/rootReducer';
import { getSettings } from 'redux/ducks/settings';

type StateProps = ReturnType<typeof mapStateToProps>;

export type DetailAccount = {
  trendsOnTarget: number;
  value: number;
  name?: string;
  accountId?: string;
  color: string;
};

export interface OwnProps<T> {
  valueUnit: string;
  formatter: (value: number) => string;
  getTrendConfig: (account: T) => { className: string; text: string; periodLabel: string }[];
  data: T[];
}

export interface IComponentState {
  orderBy: string;
  order: 'desc' | 'asc';
  anchorEl: HTMLElement;
  popoverText: React.ReactElement<HTMLDivElement>;
}

type DetailsTableProps<T> = StateProps & InjectedIntlProps & OwnProps<T>;

class DetailsTable<T extends DetailAccount> extends React.Component<
  DetailsTableProps<T>,
  IComponentState
> {
  constructor(props: DetailsTableProps<T>) {
    super(props);

    this.state = {
      orderBy: 'value',
      order: 'desc',
      anchorEl: null,
      popoverText: null
    };
  }

  changeSorting = (property: string): void => {
    this.setState({
      orderBy: property,
      order: property != this.state.orderBy || this.state.order == 'asc' ? 'desc' : 'asc'
    });
  };

  handlePopoverOpen = (anchorEl: HTMLElement, account: T): void => {
    const { formatter } = this.props;
    const periodLabel = this.getPeriodLabel();
    this.setState({
      anchorEl,
      popoverText: (
        <div style={{ padding: '8px', textAlign: 'right' }}>
          <span>{periodLabel}</span>
          <br />
          <span>{formatter(account.value)}</span>
        </div>
      )
    });
  };

  handlePopoverClose = (): void => {
    this.setState({ anchorEl: null, popoverText: null });
  };

  getPeriodLabel = (): string => {
    const {
      filter: { interval, timeFilter },
      intl
    } = this.props;

    switch (interval) {
      case 'week':
        return intl.messages['week'] + ' ' + timeFilter.substr(5, 2);
      case 'month':
        return moment(timeFilter, 'YYYYM').add(1, 'month').format('MMMM YYYY');
      case 'year':
        return timeFilter;
      default:
        return '';
    }
  };

  render() {
    const { intl, valueUnit, data, getTrendConfig } = this.props;
    const { orderBy, order, anchorEl, popoverText } = this.state;

    const sortedData = data.sort((a, b) => {
      if (a[orderBy] == b[orderBy]) {
        return order == 'asc'
          ? a.accountId > b.accountId
            ? 1
            : -1
          : a.accountId <= b.accountId
          ? 1
          : -1;
      }
      return order == 'asc'
        ? a[orderBy] > b[orderBy]
          ? 1
          : -1
        : a[orderBy] <= b[orderBy]
        ? 1
        : -1;
    });

    const tableRows = [];
    sortedData.map((account, index: number) => {
      const trendConfig = getTrendConfig(account);
      tableRows.push(
        <TableRow key={`account-${index}`}>
          <TableCell title={account.name}>{account.name}</TableCell>
          <TableCell>
            <TrendBar trends={trendConfig} />
          </TableCell>
          <TableCell>
            <div
              onMouseEnter={(e) => {
                const anchorEl = e.currentTarget;
                this.handlePopoverOpen(anchorEl, account);
              }}
              onMouseLeave={() => this.handlePopoverClose()}
              className='bar accountBar trendCurrent'
              style={{
                width: '100%',
                height: '20px',
                backgroundColor: account.color
              }}
            />
          </TableCell>
        </TableRow>
      );
    });
    tableRows.push(
      <TableRow key={'detailsTable'}>
        <TableCell />
        <TableCell>
          <Popover
            className='trendPopover'
            onClose={this.handlePopoverClose}
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
            transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          >
            {popoverText}
          </Popover>
        </TableCell>
        <TableCell />
      </TableRow>
    );

    const headerData = [
      {
        property: 'name',
        text: intl.messages['account']
      },
      {
        property: 'trendsOnTarget',
        text: intl.messages['trend']
      },
      {
        property: 'value',
        text: valueUnit,
        colSpan: 2
      }
    ];

    return (
      <Table className='detailsTable'>
        <TableHead>
          <TableRow>
            {headerData.map(({ property, text }, index: number) => (
              <HeaderCell
                key={property}
                onClick={() => this.changeSorting(property)}
                active={orderBy === property}
                direction={order}
                alignRight={index == 2}
                tooltip={intl.messages['data_table.sort']}
              >
                {text}
              </HeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <CSSTransitionGroup
          transitionName='slide'
          transitionAppear
          transitionAppearTimeout={250}
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}
          component={TableBody}
          key={`tbody`}
        >
          {tableRows}
        </CSSTransitionGroup>
      </Table>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  filter: state.dashboard.filter,
  accounts: getSettings(state).accounts
});

export default connect<StateProps, unknown, OwnProps<unknown>>(mapStateToProps)(
  injectIntl(DetailsTable)
);
