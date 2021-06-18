import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@material-ui/core';
import moment from 'moment';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import {
  CalendarDate,
  CalendarPeriod,
  DateSelection,
  DateSelectionChange,
  RenderDayProps
} from 'DatePicker/utils/constants';
import { getShortMonthNames } from 'DatePicker/utils/calendar';
import { unitOfTime } from 'moment/moment';

interface MonthViewProps {
  onClick: (date: DateSelectionChange) => void;
  period: CalendarPeriod;
  date: CalendarDate;
  selection?: DateSelection;
  showWeekNumbers?: boolean;
  isoWeek?: boolean;
  fullWeeks?: boolean;
  disableFutureDates?: boolean;
  renderDay?: (props: RenderDayProps) => React.ReactNode;
  rangeSelection?: boolean;
}

const MonthView: React.FunctionComponent<MonthViewProps> = (props) => {
  const classes = useStyles(props);
  const { date, period, selection, onClick, disableFutureDates } = props;
  const months = getShortMonthNames();

  const handleMonthClick = (e: React.MouseEvent<HTMLElement>, monthName: string) => {
    const monthNumber = months.findIndex((name) => name === monthName);
    const month = moment(date).month(monthNumber);
    onClick({ date: month });
  };

  const tableDataCells = months.map((month, index) => {
    const dateObject = moment(date).month(index);
    const isFutureDate = dateObject.isAfter(moment(), period as unitOfTime.StartOf);
    const isDisabled = disableFutureDates && isFutureDate;
    return (
      <TableCell
        key={month}
        align='center'
        className={classNames(classes.tableCell, { [classes.disabledDate]: isDisabled })}
        onClick={(e) => (isDisabled ? {} : handleMonthClick(e, month))}
      >
        <Typography
          className={classNames({
            [classes.selectedDate]:
              selection &&
              moment(date).month(index).isBetween(selection.from, selection.to, 'month', '[]')
          })}
        >
          {month}
        </Typography>
      </TableCell>
    );
  });

  const tableRows = tableDataCells
    .reduce(
      (rows, currentCell, index) => {
        if (index % 3 === 0 && index > 0) {
          rows.push([]);
        }

        rows[rows.length - 1].push(currentCell);
        return rows;
      },
      [[]]
    )
    .map((row, index) => (
      <TableRow
        key={`month_${index}`}
        className={classNames({ [classes.quarterRowHover]: period === CalendarPeriod.quarter })}
      >
        {row}
      </TableRow>
    ));

  return (
    <TableContainer>
      <Table color='primary' padding='none'>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </TableContainer>
  );
};

MonthView.defaultProps = {
  disableFutureDates: true,
  isoWeek: true,
  rangeSelection: false
};

const useStyles = makeStyles((theme) => ({
  tableCell: {
    border: 'none',
    height: theme.typography.fontSize * 4,
    width: theme.typography.fontSize * 6,
    cursor: 'pointer'
  },
  selectedDate: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.fontSize * 1.5,
    fontWeight: 'bold'
  },
  disabledDate: {
    opacity: 0.4,
    cursor: 'not-allowed',
    '& *': {
      pointerEvents: 'none'
    }
  },
  quarterRowHover: {
    cursor: 'pointer',
    '&:hover ': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

export default MonthView;
