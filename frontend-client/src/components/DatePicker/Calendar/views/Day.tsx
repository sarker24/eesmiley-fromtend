import * as React from 'react';
import moment from 'moment';
import { Moment } from 'moment';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import {
  CalendarDate,
  CalendarPeriod,
  CalendarWeek,
  DateSelection,
  DateSelectionChange,
  RenderDayProps
} from 'DatePicker/utils/constants';
import { createCalendarMonth, getShortWeekdayNames } from 'DatePicker/utils/calendar';

interface DayViewProps {
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

const DayView: React.FunctionComponent<DayViewProps & InjectedIntlProps> = (props) => {
  const classes = useStyles(props);
  const {
    onClick,
    period,
    date,
    selection,
    showWeekNumbers,
    disableFutureDates,
    intl,
    fullWeeks,
    isoWeek,
    renderDay,
    rangeSelection
  } = props;
  const today: Moment = moment();
  const weekDays = getShortWeekdayNames(isoWeek);
  const weekFn = isoWeek ? 'isoWeek' : 'week';
  const calendarWeeks: CalendarWeek[] = createCalendarMonth(date, isoWeek);

  const handleDateClick = (e: React.MouseEvent<HTMLElement>, date: CalendarDate) => {
    onClick({ date });
  };

  // extract out dayButton component ( this fn too )
  const renderDayDefault = (props: RenderDayProps) => {
    const { selection, period, date, inCurrentMonth } = props;
    const isToday = date.isSame(today, 'day');
    const isSelectedWeek =
      selection &&
      period === CalendarPeriod.week &&
      date.isBetween(selection.from, selection.to, weekFn, '[]');
    const isSelectedDay =
      isSelectedWeek || (selection && date.isBetween(selection.from, selection.to, 'day', '[]'));
    const startOfWeekDay = moment(date).startOf(weekFn);
    const endOfWeekDay = moment(date).endOf(weekFn);
    const startOfSelection = rangeSelection && selection && date.isSame(selection.from, 'day');
    const endOfSelection = rangeSelection && selection && date.isSame(selection.to, 'day');
    const middleSelection =
      rangeSelection && selection && date.isBetween(selection.from, selection.to, 'day', '()');
    return (
      <IconButton
        className={classNames({
          [classes.dayCell]: true,
          [classes.todayDate]: isToday,
          [classes.selectedDate]: isSelectedDay,
          [classes.selectionStartButton]:
            (period === CalendarPeriod.week && date.isSame(startOfWeekDay, 'day')) ||
            startOfSelection,
          [classes.selectionEndButton]:
            (period === CalendarPeriod.week && date.isSame(endOfWeekDay, 'day')) || endOfSelection,
          [classes.selectionBetweenButton]:
            (period === CalendarPeriod.week &&
              date.isBetween(startOfWeekDay, endOfWeekDay, 'day')) ||
            middleSelection,
          [classes.offMonthDate]: !inCurrentMonth
        })}
      >
        {date.date()}
      </IconButton>
    );
  };

  const renderDayFn = renderDay || renderDayDefault;

  const calendarRows = calendarWeeks.map(({ week, days }) => {
    const weekRow = showWeekNumbers
      ? [
          <TableCell key={`week_number_${week}`} align='center' className={classes.weekNumber}>
            {week}
          </TableCell>
        ]
      : [];

    days.forEach(({ year, month, day }) => {
      const dateObject = moment().year(year).month(month).date(day);
      const granularity = period === CalendarPeriod.week ? weekFn : 'day';
      const isFutureDate = dateObject.isAfter(moment(), granularity);
      const isInSelectedMonth = month === date.month();
      const isDisabled = (disableFutureDates && isFutureDate) || (!fullWeeks && !isInSelectedMonth);
      weekRow.push(
        <TableCell
          key={`month_${month}_day_${day}`}
          align='center'
          className={classNames({
            [classes.offMonthDate]: month !== date.month(),
            [classes.disabledDate]: isDisabled
          })}
          onClick={(e) => (isDisabled ? {} : handleDateClick(e, dateObject))}
        >
          {!fullWeeks && !isInSelectedMonth
            ? ''
            : renderDayFn({
                date: dateObject,
                selection,
                period,
                inCurrentMonth: isInSelectedMonth
              })}
        </TableCell>
      );
    });

    return (
      <TableRow
        key={`week_${week}`}
        className={classNames({
          [classes.weekRowHover]:
            period === CalendarPeriod.week &&
            (!selection ||
              selection.from.year() !== days[0].year ||
              selection.from[weekFn]() !== week)
        })}
      >
        {weekRow}
      </TableRow>
    );
  });

  const weekHeader = showWeekNumbers
    ? [
        <TableCell key={'week_header'} align='center' className={classes.tableHeader}>
          {intl.messages['week']}
        </TableCell>
      ]
    : [];

  const dowHeader = weekDays.map((day) => (
    <TableCell key={day} align='center' className={classes.tableHeader}>
      {day}
    </TableCell>
  ));

  const headerRow = [...weekHeader, ...dowHeader];

  return (
    <TableContainer className={classes.root}>
      <Table color='primary' size='small' padding='none'>
        <TableHead>
          <TableRow>{headerRow}</TableRow>
        </TableHead>
        <TableBody>{calendarRows}</TableBody>
      </Table>
    </TableContainer>
  );
};

DayView.defaultProps = {
  isoWeek: true,
  showWeekNumbers: true,
  fullWeeks: true,
  disableFutureDates: true,
  rangeSelection: false
};

const useStyles = makeStyles((theme) => ({
  root: {},
  tableHeader: {
    color: theme.palette.grey[500]
  },
  offMonthDate: {
    backgroundColor: theme.palette.grey['A400']
  },
  disabledDate: {
    opacity: 0.4,
    cursor: 'not-allowed',
    '& *': {
      pointerEvents: 'none'
    }
  },
  todayDate: {
    color: theme.palette.primary.main
  },
  selectedDate: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.grey.A700,

    '&:hover': {
      background: theme.palette.primary.main
    }
  },
  dayCell: {
    width: '100%',
    fontSize: theme.typography.fontSize
  },
  weekNumber: {
    color: theme.palette.grey[500],
    border: 'none'
  },
  weekRowHover: {
    cursor: 'pointer',
    '& button': {
      zIndex: 0,
      pointerEvents: 'none'
    },
    '&:hover button': {
      backgroundColor: theme.palette.action.hover
    }
  },
  selectionEndButton: {
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: '50%',
    borderTopRightRadius: '50%'
  },
  selectionStartButton: {
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: '50%',
    borderTopLeftRadius: '50%'
  },
  selectionBetweenButton: {
    borderRadius: 0
  }
}));

export default injectIntl(DayView);
