import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Divider } from '@material-ui/core';

import {
  CalendarDate,
  CalendarPeriod,
  DateChange,
  DateRange,
  DateSelectionChange,
  DEFAULT_FORMAT,
  ViewsPerPeriod
} from 'DatePicker/utils/constants';
import Calendar from 'DatePicker/Calendar';

export interface DatePickerProps {
  fullWidth?: boolean;
  className?: string;
  isoWeek?: boolean;
  showWeekNumbers?: boolean;
  fullWeeks?: boolean;
  disableFutureDates?: boolean;
  onDateChange: (dateChange: DateChange) => void;

  selection: { from: CalendarDate; to: CalendarDate };
  period?: CalendarPeriod;
  date?: CalendarDate;
  periodFormat?: { [index: string]: string };
  size?: 'small' | 'medium' | 'large';
  rangeSelection?: boolean;
}

interface State {
  edit: boolean;
  selection: DateRange;
}

type StartEditAction = {
  type: 'startEdit';
  payload: {
    selection: DateRange;
  };
};

type FinishEditAction = {
  type: 'finishEdit';
  payload: {
    selection: DateRange;
  };
};

type StateActions = StartEditAction | FinishEditAction;

function rangeReducer(state: State, action: StateActions): State {
  switch (action.type) {
    case 'startEdit':
      return { ...state, ...action.payload, edit: true };
    case 'finishEdit':
      return { ...state, ...action.payload, edit: false };
    default:
      throw new Error();
  }
}

const RangePeriod = CalendarPeriod.day;

const DateRangeController: React.FunctionComponent<DatePickerProps & InjectedIntlProps> = (
  props
) => {
  const classes = useStyles(props);
  const { period, date, onDateChange, selection, ...sharedProps } = props;
  const [state, dispatch] = React.useReducer(rangeReducer, { selection, edit: false });

  React.useEffect(() => {
    dispatch({ type: 'finishEdit', payload: { selection } });
  }, [selection]);

  const handleDateChange = (change: DateSelectionChange) => {
    const { selection: stateDate, edit } = state;
    if (edit) {
      const selection = change.date.isAfter(stateDate.from)
        ? {
            from: stateDate.from,
            to: change.date
          }
        : { from: change.date, to: stateDate.from };
      onDateChange({
        ...selection,
        type: CalendarPeriod.custom,
        value: selection.to.diff(selection.from, 'days')
      });
    } else {
      dispatch({
        type: 'startEdit',
        payload: { selection: { from: change.date, to: change.date } }
      });
    }
  };

  return (
    <>
      <Calendar
        {...sharedProps}
        rangeSelection={true}
        views={ViewsPerPeriod[RangePeriod]}
        onDateChange={handleDateChange}
        period={RangePeriod}
        date={state.selection ? state.selection.from : date}
        selection={state.selection}
      />
      <Divider orientation='vertical' className={classes.divider} />
      <Calendar
        {...sharedProps}
        rangeSelection={true}
        views={ViewsPerPeriod[RangePeriod]}
        onDateChange={handleDateChange}
        period={RangePeriod}
        date={state.selection ? state.selection.to : date}
        selection={state.selection}
      />
    </>
  );
};

DateRangeController.defaultProps = {
  isoWeek: true,
  disableFutureDates: true,
  showWeekNumbers: true,
  fullWeeks: true,
  periodFormat: DEFAULT_FORMAT,
  size: 'medium'
};

const useStyles = makeStyles({
  divider: {
    height: 'auto'
  }
});

export default injectIntl(DateRangeController);
