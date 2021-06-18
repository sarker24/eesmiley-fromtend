import './index.scss';
import Container from 'components/container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  createStyles,
  withStyles,
  WithStyles,
  Tooltip
} from '@material-ui/core';
import HeaderCell from 'components/table/HeaderCell';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/HelpOutline';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import FormattedMessage from 'components/formatted-message';
import * as React from 'react';
import { formatWeight, formatMoney } from 'utils/number-format';
import moment from 'moment';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { getFullRegistrationPath } from 'utils/helpers';
import classNames from 'classnames';
import { Registration } from 'redux/ducks/data/registrations';

const styles = createStyles({
  nameCell: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  infoIcon: {
    color: '#999',
    width: 16,
    height: 16,
    verticalAlign: 'bottom',
    marginLeft: '10px'
  },
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

interface OwnProps {
  registrations: Registration[];
  deleteHandler: (id: string) => void;
  registrationPointsMap: Map<string, RegistrationPoint>;
}

interface IComponentState {
  orderBy?: string;
  order: 'asc' | 'desc';
  page: number;
  rowsPerPage: number;
}

type HistoryProps = InjectedIntlProps & OwnProps & WithStyles<typeof styles>;

class History extends React.Component<HistoryProps, IComponentState> {
  constructor(props: HistoryProps) {
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

  render() {
    const { registrations, deleteHandler, classes } = this.props;

    const { orderBy, order, page, rowsPerPage } = this.state;

    const sortedRegistrations = registrations.sort((ar, br) => {
      let customOrderBy = orderBy;

      const a = customOrderBy === 'name' ? ar.registrationPoint : ar;
      const b = customOrderBy === 'name' ? br.registrationPoint : br;

      if (a[orderBy] === b[orderBy]) {
        customOrderBy = 'id';
      }

      return order === 'asc'
        ? a[customOrderBy] < b[customOrderBy]
          ? -1
          : 1
        : a[customOrderBy] > b[customOrderBy]
        ? -1
        : 1;
    });

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const slicedRegistrations = sortedRegistrations.slice(startIndex, endIndex);

    const tableRows = [];
    let weightSum = 0;
    let costSum = 0;
    let co2Sum = 0;

    for (const registration of sortedRegistrations) {
      weightSum += registration.amount;
      costSum += registration.cost;
      co2Sum += registration.co2;
    }

    for (let i = 0; i < slicedRegistrations.length; i++) {
      const registration = slicedRegistrations[i];
      const regPointStatus = registration.registrationPoint.deletedAt
        ? 'deleted'
        : registration.registrationPoint.active
        ? 'active'
        : 'inactive';
      const regPointTooltipTitle = <FormattedMessage id={`settings.status.${regPointStatus}`} />;
      const regPointPath = getFullRegistrationPath(this.props.registrationPointsMap, {
        id: String(registration.id)
      }).map((p) => p.name);

      tableRows.push(
        <TableRow key={registration.id}>
          <TableCell>{moment(registration.date).format('L')}</TableCell>
          <TableCell>
            <div className={classes.nameCell}>
              <Tooltip title={regPointTooltipTitle} enterTouchDelay={50} placement={'bottom'}>
                <span className={classNames(classes.statusDot, regPointStatus)} />
              </Tooltip>
              {registration.registrationPoint.name}
              {regPointPath.length > 1 && (
                <Tooltip title={regPointPath.join(' ➔ ')} enterTouchDelay={50} placement={'right'}>
                  <InfoIcon className={classes.infoIcon} />
                </Tooltip>
              )}
            </div>
          </TableCell>
          <TableCell align='right'>{formatWeight(registration.amount)}</TableCell>
          <TableCell align='right'>{formatMoney(registration.cost).toString()}</TableCell>
          <TableCell align='right'>{formatWeight(registration.co2)}</TableCell>
          <TableCell align='right'>
            <Tooltip title={<FormattedMessage id='data_table.delete' />} placement={'left'}>
              <IconButton
                className={classes.deleteButton}
                onClick={() => deleteHandler(String(registration.id))}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      );
    }

    const headerData = [
      { property: 'date', translationKey: 'date' },
      { property: 'name', translationKey: 'registrationPoint' },
      { property: 'amount', translationKey: 'registration.history.weight', alignRight: true },
      { property: 'cost', translationKey: 'registration.history.cost', alignRight: true },
      { property: 'co2', translationKey: 'registration.history.co2', alignRight: true },
      { property: 'delete', alignRight: true }
    ];

    return (
      <Container
        className='recent-history'
        title={<FormattedMessage id='registration.recentHistory' />}
      >
        <Table>
          <TableHead>
            <TableRow>
              {headerData.map(({ property, translationKey, alignRight }) => (
                <HeaderCell
                  key={property}
                  onClick={() => this.changeSorting(property)}
                  active={this.state.orderBy === property}
                  direction={this.state.order}
                  alignRight={alignRight}
                  tooltip={<FormattedMessage id='data_table.sort' />}
                >
                  {translationKey && <FormattedMessage id={translationKey} html />}
                </HeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows}
            <TableRow key={'totals'}>
              <TableCell colSpan={2}>
                <FormattedMessage id={'report.registration_list.total'} />
              </TableCell>
              <TableCell align='right'>{formatWeight(weightSum)}</TableCell>
              <TableCell align='right'>{formatMoney(costSum).toString()}</TableCell>
              <TableCell align='right'>{formatWeight(co2Sum)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
        <TablePagination
          component={'div'}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} (${count})`}
          labelRowsPerPage={<FormattedMessage id='pagination' />}
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
