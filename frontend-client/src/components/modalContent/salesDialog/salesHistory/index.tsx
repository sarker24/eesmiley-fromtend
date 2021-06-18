import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { IReportSale } from 'utils/interfaces';
import FormattedMass from 'components/formatted-mass';
import FormattedCost from 'components/formatted-cost';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import HeaderCell from 'components/table/HeaderCell';
import { CSSTransitionGroup } from 'react-transition-group';
import moment from 'moment';
import { Sale } from 'redux/ducks/sales';
import { Registration } from 'redux/ducks/data/registrations';
import { sum } from 'utils/array';

export interface OwnProps {
  sales: Sale[];
  registrationsByDate: { [date: string]: Registration[] };
  historyItemOnClick?: (sale: Sale) => void;
  selectedSale?: Partial<Sale>;
  currency: string;
  massUnit: string;
}

export interface IComponentState {
  selectedSale?: {
    income: number | string;
    portionPrice: number | string;
    guests: number | string;
    productionCost: number | string;
    productionWeight: number | string;
    portions: number | string;
    date: any;
  };
  error?: boolean;
  orderBy?: string;
  sortedSales: Sale[];
  loaded?: boolean;
  order?: 'asc' | 'desc';
  showDataFields?: boolean;
  showSalesHistory?: boolean;
}

type SalesHistoryProps = InjectedIntlProps & OwnProps;

export class SalesHistory extends React.Component<SalesHistoryProps, IComponentState> {
  sales: IReportSale[] = [];

  constructor(props: SalesHistoryProps) {
    super(props);

    this.state = {
      sortedSales: []
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: SalesHistoryProps, nextState: IComponentState) {
    if (this.props.sales != nextProps.sales) {
      this.sortSales(nextProps.sales, nextState.orderBy, nextState.order);
    }
  }

  changeSorting = (property: string) => {
    const { order } = this.state;

    this.sortSales(this.props.sales, property, order == 'asc' ? 'desc' : 'asc');
  };

  sortSales = (sales: Sale[], orderBy = 'date', order: 'asc' | 'desc' = 'desc') => {
    const sortByDate = (a: Sale, b: Sale): number => (a[orderBy] < b[orderBy] ? -1 : 1);
    const sortByOther = (a: Sale, b: Sale): number =>
      parseInt(a[orderBy]) < parseInt(b[orderBy]) ? -1 : 1;

    const sortBy = orderBy === 'date' ? sortByDate : sortByOther;
    const sortFn = (a: Sale, b: Sale): number =>
      order === 'desc' ? -1 * sortBy(a, b) : sortBy(a, b);

    this.setState({
      sortedSales: sales.sort(sortFn),
      orderBy: orderBy,
      order: order
    });
  };

  render() {
    const { order, orderBy, sortedSales } = this.state;
    const {
      currency,
      massUnit,
      selectedSale,
      registrationsByDate,
      historyItemOnClick
    } = this.props;

    const headerData = [
      { property: 'date', translationKey: 'date' },
      {
        property: 'income',
        translationKey: 'sales.dialog.table.income',
        values: { currency },
        alignRight: true
      },
      {
        property: 'portionPrice',
        translationKey: 'sales.dialog.table.salesPrice',
        values: { currency },
        alignRight: true
      },
      { property: 'guests', translationKey: 'sales.dialog.table.guests', alignRight: true },
      {
        property: 'productionCost',
        translationKey: 'sales.dialog.table.productionCost',
        values: { currency },
        alignRight: true
      },
      {
        property: 'productionWeight',
        translationKey: 'sales.dialog.table.productionWeight',
        values: { massUnit },
        alignRight: true
      },
      { property: 'portions', translationKey: 'sales.dialog.table.portions', alignRight: true },
      {
        property: 'foodwasteWeight',
        translationKey: 'sales.dialog.table.weight',
        values: { massUnit },
        alignRight: true
      }
    ];

    const tableRows = [];

    if (sortedSales) {
      for (let i = 0; i < sortedSales.length; i++) {
        const sale = sortedSales[i];
        const registrations = registrationsByDate[sale.date];
        const wasteWeight = registrations ? sum(registrations.map((r) => r.amount)) : 0;
        tableRows.push(
          <TableRow
            key={`${sale.date}-${sale.customerId}`}
            hover
            onClick={() => historyItemOnClick(sale)}
            selected={
              selectedSale &&
              selectedSale.date === sale.date &&
              selectedSale.customerId == sale.customerId
            }
          >
            <TableCell>{moment(sale.date).format('L')}</TableCell>
            <TableCell align='right'>
              <FormattedCost value={sale.income} style='decimal' />
            </TableCell>
            <TableCell align='right'>
              <FormattedCost value={sale.portionPrice} style='decimal' />
            </TableCell>
            <TableCell align='right'>{sale.guests}</TableCell>
            <TableCell align='right'>
              <FormattedCost value={sale.productionCost} style='decimal' />
            </TableCell>
            <TableCell align='right'>
              <FormattedMass value={sale.productionWeight} normalized={true} style='decimal' />
            </TableCell>
            <TableCell align='right'>{sale.portions}</TableCell>
            <TableCell align='right'>
              <FormattedMass value={wasteWeight} normalized={true} style='decimal' />
            </TableCell>
          </TableRow>
        );
      }
    }

    return (
      <Table stickyHeader style={{ overflow: 'auto', whiteSpace: 'nowrap' }}>
        <TableHead>
          <TableRow>
            {headerData.map(({ property, translationKey, values, alignRight }) => (
              <HeaderCell
                key={property}
                onClick={() => this.changeSorting(property)}
                active={orderBy === property}
                direction={order}
                alignRight={alignRight}
                tooltip={<FormattedMessage id='data_table.sort' />}
              >
                {translationKey && <FormattedMessage id={translationKey} values={values} />}
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

export default injectIntl(SalesHistory);
