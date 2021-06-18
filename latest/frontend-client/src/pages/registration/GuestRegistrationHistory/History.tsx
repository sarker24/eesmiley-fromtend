import './index.scss';
import Container from 'components/container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  createStyles,
  WithStyles,
  IconButton,
  withStyles
} from '@material-ui/core';
import HeaderCell from 'components/table/HeaderCell';
import DeleteIcon from '@material-ui/icons/Delete';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Tooltip } from '@material-ui/core';
import * as React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { GuestRegistration } from 'redux/ducks/guestRegistrations';

const styles = createStyles({
  statusDot: {
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '10px',
    width: '10px',
    height: '10px',
    position: 'relative'
  },
  deleteButton: {
    width: 'initial',
    height: 'initial',
    padding: 0,
    color: 'rgba(0, 0, 0, 0.54)',
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.87)'
    }
  }
});

export interface HistoryColumn {
  property: string;
  label?: string;
  alignRight?: boolean;
  hidden?: boolean;
  numeric?: boolean;
}

interface IComponentProps extends InjectedIntlProps, WithStyles<typeof styles> {
  columns: HistoryColumn[];
  registrations: GuestRegistration[];
  onDelete: (id: number) => void;
}

interface IComponentState {
  orderBy?: string;
  order: 'asc' | 'desc';
  page: number;
  rowsPerPage: number;
}

class History extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      orderBy: 'date',
      order: 'desc',
      page: 0,
      rowsPerPage: 10
    };
  }

  changeSorting = (property: string) => {
    const { orderBy, order } = this.state;

    if (property !== orderBy) {
      this.setState({ orderBy: property, order: 'desc', page: 0 });
    } else {
      this.setState({ orderBy: property, order: order == 'asc' ? 'desc' : 'asc', page: 0 });
    }
  };

  renderColumn = (column: HistoryColumn, data: GuestRegistration) => {
    const { classes } = this.props;

    switch (column.property) {
      case 'amount':
        return data.amount;
      case 'date':
        return moment(data.date).format('L');
      case 'delete': {
        const { intl, onDelete } = this.props;

        return (
          <>
            <Tooltip title={intl.messages['data_table.delete']} placement={'left'}>
              <IconButton className={classes.deleteButton} onClick={() => onDelete(data.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        );
      }
      case 'name': {
        const { intl } = this.props;
        const { guestType } = data;
        const status = guestType
          ? guestType.deletedAt
            ? 'deleted'
            : guestType.active
            ? 'active'
            : 'inactive'
          : 'active';
        const toolTipTitle = intl.messages[`settings.status.${status}`];
        return (
          <>
            <Tooltip title={toolTipTitle} enterTouchDelay={50} placement={'bottom'}>
              <span className={classNames(classes.statusDot, status)} />
            </Tooltip>
            {(guestType && guestType.name) || '-'}
          </>
        );
      }
    }
  };

  render() {
    const { registrations, columns, intl } = this.props;

    const { orderBy, order, page, rowsPerPage } = this.state;

    const sortedRegistrations = registrations.sort((a, b) => {
      let customOrderBy = orderBy;

      const aCopy = customOrderBy === 'name' ? a.guestType || { name: '-' } : a;
      const bCopy = customOrderBy === 'name' ? b.guestType || { name: '-' } : b;

      if (aCopy[orderBy] === bCopy[orderBy]) {
        customOrderBy = 'id';
      }

      return order === 'asc'
        ? aCopy[customOrderBy] < bCopy[customOrderBy]
          ? -1
          : 1
        : aCopy[customOrderBy] > bCopy[customOrderBy]
        ? -1
        : 1;
    });

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const slicedRegistrations = sortedRegistrations.slice(startIndex, endIndex);

    let totalAmount = 0;

    for (const registration of sortedRegistrations) {
      totalAmount += registration.amount;
    }

    const tableRows = slicedRegistrations.map((slicedRegistration) => (
      <TableRow key={slicedRegistration.id}>
        {columns.map((column) => (
          <TableCell
            key={`${slicedRegistration.id}_${column.property}`}
            align={column.numeric ? 'right' : 'left'}
          >
            {this.renderColumn(column, slicedRegistration)}
          </TableCell>
        ))}
      </TableRow>
    ));

    return (
      <Container
        className='recent-history-guests'
        title={intl.messages['registration.recentHistory']}
      >
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(({ property, label, alignRight, hidden }) => (
                <HeaderCell
                  className={hidden ? 'hidden' : undefined}
                  key={property}
                  onClick={() => this.changeSorting(property)}
                  active={this.state.orderBy === property}
                  direction={this.state.order}
                  alignRight={alignRight}
                  tooltip={intl.messages['data_table.sort']}
                >
                  {label}
                </HeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows}
            <TableRow key={'totals'}>
              <TableCell colSpan={columns.length < 4 ? 1 : 2}>
                {intl.messages['report.registration_list.total']}
              </TableCell>
              <TableCell align='right'>{totalAmount}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
        <TablePagination
          component={'div'}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} (${count})`}
          labelRowsPerPage={intl.messages['pagination']}
          count={registrations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={(event, page) => {
            this.setState({ page });
          }}
          onChangeRowsPerPage={(event) => {
            this.setState({ rowsPerPage: parseInt(event.target.value) });
          }}
        />
      </Container>
    );
  }
}

export default injectIntl(withStyles(styles)(History));
