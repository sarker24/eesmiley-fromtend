import * as React from 'react';
import { injectIntl, InjectedIntl } from 'react-intl';
import { Table, TableBody, TableCell, TableHead, TableRow, Popover } from '@material-ui/core';
import HeaderCell from 'components/table/HeaderCell';
import { CSSTransitionGroup } from 'react-transition-group';
import { formatWeight } from 'utils/number-format';

import '../../../../../../dashboardGauge/components/detailsTable/index.scss';
import { WasteAccountWithPercentage } from 'redux/ducks/dashboard';

export interface IComponentProps {
  children?: React.ReactElement;
  barColor: string;
  valueUnit: string;
  totalAmount: number;
  data: WasteAccountWithPercentage[];
  intl: InjectedIntl;
}

export interface IComponentState {
  orderBy: keyof WasteAccountWithPercentage;
  order: 'desc' | 'asc';
  maxAmount: number;
  data: WasteAccountWithPercentage[];
  anchorEl: HTMLElement;
  popoverText: React.ReactElement<HTMLDivElement>;
}

function sortData(
  data: WasteAccountWithPercentage[],
  orderBy: keyof WasteAccountWithPercentage,
  order: 'asc' | 'desc'
) {
  return data.sort((a, b) => {
    if (a[orderBy] == b[orderBy]) {
      return order == 'asc'
        ? a.accountId > b.accountId
          ? 1
          : -1
        : a.accountId <= b.accountId
        ? 1
        : -1;
    }
    return order == 'asc' ? (a[orderBy] > b[orderBy] ? 1 : -1) : a[orderBy] <= b[orderBy] ? 1 : -1;
  });
}

export class ProductDetailsAccountTable extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      orderBy: 'amount',
      order: 'desc',
      maxAmount: 0,
      data: [],
      anchorEl: null,
      popoverText: null
    };
  }

  static getDerivedStateFromProps(nextProps: IComponentProps, prevState: IComponentState) {
    if (
      !prevState.data.length &&
      (nextProps.data !== prevState.data || nextProps.totalAmount !== prevState.maxAmount)
    ) {
      return {
        data: sortData(nextProps.data, prevState.orderBy, prevState.order),
        maxAmount: nextProps.totalAmount
      };
    }
    return null;
  }

  changeSorting = (orderBy: keyof WasteAccountWithPercentage) => {
    const order = orderBy != this.state.orderBy || this.state.order == 'asc' ? 'desc' : 'asc';

    this.setState({
      orderBy,
      order,
      data: sortData(this.state.data, orderBy, order)
    });
  };

  handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement>,
    registrationPoint: WasteAccountWithPercentage
  ) => {
    const { intl } = this.props;
    this.setState({
      anchorEl: event.currentTarget,
      popoverText: (
        <div className='detailsPopover'>
          {intl.messages['amount'] + intl.messages['colon']}
          <strong>{formatWeight(registrationPoint.amount)}</strong>
          <br />
          {intl.messages[
            'dashboard.widgets.expectedWeeklyWasteGauge.products.percentageOfProductSpecificFoodWaste'
          ] + intl.messages['colon']}
          <strong>
            {intl.formatNumber(registrationPoint.amountPercentage, { maximumFractionDigits: 1 })}%
          </strong>
        </div>
      )
    });
  };

  handlePopoverClose = () => {
    this.setState({
      anchorEl: null,
      popoverText: null
    });
  };

  renderRows = (data: WasteAccountWithPercentage[]) => {
    const { intl, barColor } = this.props;

    return data.map((account, index: number) => {
      const { name, amount } = account;

      return (
        <TableRow key={`account-${index}`} className={amount === 0 ? 'noRegistrationsFound' : ''}>
          <TableCell>{<p>{name}</p>}</TableCell>
          {amount === 0 ? (
            <TableCell>{intl.messages['noRegistrationsFound']}</TableCell>
          ) : (
            <TableCell
              onMouseOver={(e) => this.handlePopoverOpen(e, account)}
              onMouseLeave={() => this.handlePopoverClose()}
            >
              <div className='bar accountBar'>
                <div
                  className='barInner'
                  style={{
                    float: 'right',
                    width: `${account.amountPercentage}%`,
                    backgroundColor: barColor
                  }}
                />
              </div>
            </TableCell>
          )}
          <TableCell style={{ textAlign: 'right' }}>{formatWeight(amount)}</TableCell>
        </TableRow>
      );
    });
  };

  render() {
    const { intl, valueUnit } = this.props;
    const { orderBy, order, data, anchorEl, popoverText } = this.state;

    return (
      <div className='detailsTableWrapper'>
        <Popover
          className='trendPopover'
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
          transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        >
          {popoverText}
        </Popover>
        <Table className='productDetailsAccountTable detailsTable'>
          <TableHead>
            <TableRow>
              <HeaderCell
                key={1}
                onClick={() => this.changeSorting('name')}
                active={orderBy === 'name'}
                direction={order}
                tooltip={intl.messages['data_table.sort']}
              >
                {intl.messages['account']}
              </HeaderCell>
              <HeaderCell
                key={3}
                colSpan={2}
                alignRight={true}
                onClick={() => this.changeSorting('amount')}
                active={orderBy === 'amount'}
                direction={order}
                tooltip={intl.messages['data_table.sort']}
              >
                {intl.formatMessage({ id: 'registration.history.weight' }, { massUnit: valueUnit })}
              </HeaderCell>
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
            {this.renderRows(data)}
          </CSSTransitionGroup>
        </Table>
      </div>
    );
  }
}

export default injectIntl(ProductDetailsAccountTable);
