import * as React from 'react';
import moment from 'moment';
import MonthView from 'components/DatePicker/Calendar/views/Month';
import YearView from 'components/DatePicker/Calendar/views/Year';
import DayView from 'components/DatePicker/Calendar/views/Day';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Slide, Typography } from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import {
  CalendarDate,
  CalendarPeriod,
  DateSelection,
  DateSelectionChange
} from 'DatePicker/utils/constants';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { allowNextNavigation } from 'DatePicker/utils/calendar';
import { API_DATE_FORMAT } from 'utils/datetime';

enum NavDirection {
  previous = 'left',
  next = 'right'
}

interface CalendarProps {
  date?: CalendarDate;
  period?: CalendarPeriod;
  selection?: DateSelection;
  onDateChange: (dateChange: DateSelectionChange) => void;
  views?: CalendarPeriod[];
  showWeekNumbers?: boolean;
  isoWeek?: boolean;
  fullWeeks?: boolean;
  disableFutureDates?: boolean;
  rangeSelection?: boolean;
}

// gets available period of highest granularity
function getBasePeriod(views: CalendarPeriod[]): CalendarPeriod {
  const sortedViews = Object.values(CalendarPeriod).filter((view) => views.includes(view));
  return sortedViews[0];
}

type NavSlide = { direction: NavDirection; in: boolean };

const ViewComponents: {
  [key in CalendarPeriod]?: typeof DayView | typeof MonthView | typeof YearView;
} = {
  [CalendarPeriod.day]: DayView,
  [CalendarPeriod.week]: DayView,
  [CalendarPeriod.month]: MonthView,
  [CalendarPeriod.quarter]: MonthView,
  [CalendarPeriod.year]: YearView
};

type InternalState = { viewPeriod: CalendarPeriod; viewDate: CalendarDate };

const Today = moment();

const Calendar: React.FunctionComponent<CalendarProps & InjectedIntlProps> = (props) => {
  const classes = useStyles(props);
  const {
    onDateChange,
    views,
    selection,
    disableFutureDates,
    rangeSelection,
    date = selection ? selection.from : Today,
    period = CalendarPeriod.day,
    intl
  } = props;
  const calendarPeriod = period === CalendarPeriod.custom ? CalendarPeriod.day : period;
  const basePeriod: CalendarPeriod = getBasePeriod([calendarPeriod, ...views]);
  const [navSlide, setNavSlide] = React.useState<NavSlide>({
    direction: NavDirection.next,
    in: true
  });
  const [internalState, setInternalState] = React.useState<InternalState>({
    viewPeriod: period,
    viewDate: date
  });

  const handleDateChange = (dateChange: DateSelectionChange) => {
    if (internalState.viewPeriod !== basePeriod) {
      setInternalState({ viewPeriod: basePeriod, viewDate: dateChange.date });
    }
    if (internalState.viewPeriod === calendarPeriod) {
      onDateChange(dateChange);
    }
  };

  React.useEffect(() => {
    if (internalState.viewDate !== date || internalState.viewPeriod !== calendarPeriod) {
      setInternalState({ viewPeriod: period, viewDate: date });
    }
  }, [calendarPeriod, date]);

  const toggleViewPeriod = (view: CalendarPeriod) => {
    setInternalState((prev) => ({
      ...prev,
      viewPeriod: prev.viewPeriod === view ? basePeriod : view
    }));
  };

  const showMonth = () => toggleViewPeriod(CalendarPeriod.month);
  const showYear = () => toggleViewPeriod(CalendarPeriod.year);

  const handleNavDirection = (dateChange: DateSelectionChange, direction: NavDirection) => {
    setNavSlide({ direction, in: false });
    setTimeout(() => {
      setInternalState((prev) => ({ ...prev, viewDate: dateChange.date }));
      setNavSlide((prev) => ({ ...prev, in: true }));
    }, 200);
  };

  const handlePrevious = () => {
    const period = [CalendarPeriod.day, CalendarPeriod.week].includes(internalState.viewPeriod)
      ? CalendarPeriod.month
      : CalendarPeriod.year;
    const date = moment(internalState.viewDate).subtract(1, period);
    handleNavDirection({ date }, NavDirection.previous);
  };

  const handleNext = () => {
    const period = [CalendarPeriod.day, CalendarPeriod.week].includes(internalState.viewPeriod)
      ? CalendarPeriod.month
      : CalendarPeriod.year;
    const date = moment(internalState.viewDate).add(1, period);
    if (allowNextNavigation(date, disableFutureDates)) {
      handleNavDirection({ date }, NavDirection.next);
    }
  };

  const dir = navSlide.in
    ? navSlide.direction === NavDirection.previous
      ? NavDirection.next
      : NavDirection.previous
    : navSlide.direction;
  const ViewComponent = ViewComponents[internalState.viewPeriod];
  return (
    <div className={classes.root}>
      <div className={classes.navigationLeft}>
        <IconButton size='small' edge='start' onClick={handlePrevious}>
          <KeyboardArrowLeftIcon />
        </IconButton>
      </div>
      <div className={classes.slideContainer}>
        <Slide direction={dir} in={navSlide.in} mountOnEnter timeout={120}>
          <div className={classes.calendar}>
            <div className={classes.calendarNavigation}>
              {views.includes(CalendarPeriod.month) && (
                <Typography color='textPrimary' variant='h5' component='h4' onClick={showMonth}>
                  {internalState.viewDate.format('MMMM')}
                </Typography>
              )}
              {views.includes(CalendarPeriod.quarter) && (
                <Typography color='textPrimary' variant='h5' component='h4' onClick={showMonth}>
                  {internalState.viewDate.format('Qo') + ' ' + intl.messages['quarter']}
                </Typography>
              )}
              {views.includes(CalendarPeriod.year) && (
                <Typography color='textPrimary' variant='h5' component='h4' onClick={showYear}>
                  {internalState.viewDate.format('Y')}
                </Typography>
              )}
            </div>
            <div className={classes.calendarView}>
              <ViewComponent
                key={
                  rangeSelection
                    ? selection
                      ? selection.from.format(API_DATE_FORMAT)
                      : 'no-selection'
                    : period
                }
                onClick={handleDateChange}
                period={internalState.viewPeriod}
                date={internalState.viewDate}
                selection={selection}
                rangeSelection={rangeSelection}
              />
            </div>
          </div>
        </Slide>
      </div>
      <div className={classes.navigationRight}>
        <IconButton size='small' edge='end' onClick={handleNext}>
          <KeyboardArrowRightIcon />
        </IconButton>
      </div>
    </div>
  );
};

Calendar.defaultProps = {
  views: Object.values(CalendarPeriod),
  showWeekNumbers: true,
  isoWeek: true,
  fullWeeks: true,
  disableFutureDates: true,
  rangeSelection: false
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    marginBottom: 'auto'
  },
  navigationLeft: {},
  navigationRight: {},
  calendar: {},
  calendarNavigation: {
    marginBottom: theme.spacing(2),
    display: 'inline-flex',
    justifyContent: 'space-evenly',
    width: '100%',
    '& > * ': {
      cursor: 'pointer'
    }
  },
  calendarView: {
    minWidth: '330px',
    height: '320px'
  },
  slideContainer: {
    position: 'relative',
    overflow: 'hidden'
  }
}));

export default injectIntl(Calendar);
