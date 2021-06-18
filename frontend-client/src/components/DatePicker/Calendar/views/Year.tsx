import * as React from 'react';
import moment from 'moment';
import { Moment } from 'moment';
import { List, ListItem, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import {
  CalendarDate,
  CalendarPeriod,
  DateSelection,
  DateSelectionChange,
  RenderDayProps
} from 'DatePicker/utils/constants';

interface YearViewProps {
  from?: Moment;
  to?: Moment;
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

const CurrentYear = moment().year();

const YearView: React.FunctionComponent<YearViewProps> = (props) => {
  const classes = useStyles(props);
  const { from, to, onClick, date, selection, disableFutureDates } = props;
  const yearDiff = to.diff(from, 'year') + 1;
  const years: number[] = Array.from(Array(yearDiff), (_, index) =>
    moment(from).add(index, 'year').year()
  );

  const handleYearClick = (e: React.MouseEvent<HTMLElement>, year: number) => {
    const yearDate = moment(date).year(year);
    onClick({ date: yearDate });
  };

  return (
    <List className={classes.root}>
      {years.map((year) => {
        const isFutureDate = moment().year() < year;
        const isDisabled = disableFutureDates && isFutureDate;
        return (
          <ListItem
            key={year}
            className={classes.listItem}
            autoFocus={selection ? selection.from.year() === year : CurrentYear === year}
            onClick={(e) => (isDisabled ? {} : handleYearClick(e, year))}
            button
          >
            <ListItemText
              className={classNames(classes.listItemText, {
                [classes.listItemTextSelected]:
                  selection && selection.from.year() <= year && selection.to.year() >= year,
                [classes.disabledDate]: isDisabled
              })}
            >
              {year}
            </ListItemText>
          </ListItem>
        );
      })}
    </List>
  );
};

YearView.defaultProps = {
  from: moment('1990-01-01'),
  to: moment(),
  disableFutureDates: true,
  isoWeek: true,
  rangeSelection: false
};

const useStyles = makeStyles((theme) => ({
  root: {
    overflowY: 'auto',
    height: '100%'
  },
  listItem: {
    '&.Mui-selected': {
      backgroundColor: 'initial'
    }
  },
  listItemTextSelected: {
    '& > span': {
      color: theme.palette.primary.main,
      fontSize: '1.5rem',
      fontWeight: 'bold'
    }
  },
  disabledDate: {
    opacity: 0.4,
    cursor: 'not-allowed',
    '& *': {
      pointerEvents: 'none'
    }
  },
  listItemText: {
    textAlign: 'center'
  }
}));

export default YearView;
