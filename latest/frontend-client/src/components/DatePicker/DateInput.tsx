import * as React from 'react';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import classNames from 'classnames';
import { Button, ButtonGroup, ClickAwayListener, Fade, Popper } from '@material-ui/core';

import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import {
  CalendarDate,
  CalendarPeriod,
  DateChange,
  DateSelection,
  DEFAULT_FORMAT,
  parsePeriodDate
} from 'DatePicker/utils/constants';
import { allowNextNavigation } from 'DatePicker/utils/calendar';
import DatePicker from 'DatePicker/DatePicker';

export interface DatePickerProps {
  fullWidth?: boolean;
  className?: string;
  isoWeek?: boolean;
  showWeekNumbers?: boolean;
  fullWeeks?: boolean;
  periods?: CalendarPeriod[];
  disableFutureDates?: boolean;
  onDateChange: (dateChange: DateChange) => void;

  selection: { from: CalendarDate; to: CalendarDate };
  period: CalendarPeriod;
  openToDate?: CalendarDate;
  periodFormat?: { [index: string]: string };
  size?: 'small' | 'medium' | 'large';
  rangeSelection?: boolean;
}

function getNextPeriod(
  selection: DateSelection,
  period: CalendarPeriod,
  isoWeek: boolean,
  dir: 'next' | 'prev'
) {
  const op = dir === 'next' ? 'add' : 'subtract';
  if (period === CalendarPeriod.custom) {
    const days = selection.to.diff(selection.from, 'days') + 1;
    return {
      value: days,
      from: moment(selection.from)[op](days, 'days'),
      to: moment(selection.to)[op](days, 'days'),
      type: period
    };
  }

  return parsePeriodDate({
    date: moment(selection.from)[op](1, period),
    period,
    isoWeek
  });
}

const DateInput: React.FunctionComponent<DatePickerProps & InjectedIntlProps> = (props) => {
  const classes = useStyles(props);
  const { intl, fullWidth, className, periodFormat, size, ...sharedProps } = props;
  const { onDateChange, period, selection, isoWeek } = sharedProps;
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const handleNextPeriod = () => {
    const nextPeriod = getNextPeriod(selection, period, isoWeek, 'next');
    if (allowNextNavigation(nextPeriod.from, sharedProps.disableFutureDates)) {
      onDateChange(nextPeriod);
    }
  };

  const handlePreviousPeriod = () => {
    const nextPeriod = getNextPeriod(selection, period, isoWeek, 'prev');
    onDateChange(nextPeriod);
  };

  const labelFormat = periodFormat[period];
  const open = Boolean(anchorEl);
  const id = open ? 'date-time-picker' : undefined;

  return (
    <div
      className={classNames({
        [className]: Boolean(className),
        [classes.fullWidth]: Boolean(fullWidth)
      })}
    >
      <ButtonGroup size={size} color='primary' variant='outlined' fullWidth>
        <Button className={classes.fixedWidth} onClick={handlePreviousPeriod}>
          <KeyboardArrowLeftIcon />
        </Button>
        <Button
          classes={{ label: classes.dateLabel }}
          fullWidth
          className={classes.dateButton}
          aria-describedby={id}
          type='button'
          onClick={handleMenuClick}
          variant='outlined'
          color='primary'
        >
          {selection.from.format(labelFormat)} | {intl.messages[period]}
        </Button>
        <Button className={classes.fixedWidth} onClick={handleNextPeriod}>
          <KeyboardArrowRightIcon />
        </Button>
      </ButtonGroup>
      <Popper
        className={classes.popper}
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement='bottom-start'
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Fade {...TransitionProps} timeout={300}>
              <DatePicker {...sharedProps} />
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </div>
  );
};

DateInput.defaultProps = {
  isoWeek: true,
  periods: Object.values(CalendarPeriod),
  disableFutureDates: true,
  showWeekNumbers: true,
  fullWeeks: true,
  periodFormat: DEFAULT_FORMAT,
  size: 'medium'
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    height: '300px',
    marginBottom: 'auto'
  },
  fullWidth: {
    width: '100%'
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row',
    [theme.breakpoints.down('xs')]: {
      flexFlow: 'column'
    }
  },
  periodBox: {
    [theme.breakpoints.down('xs')]: {
      borderBottom: `1px solid ${theme.palette.action.hover}`,
      marginBottom: theme.spacing(2),
      '& .MuiList-root': {
        display: 'inline-flex',
        width: '100%',
        justifyContent: 'center'
      }
    },
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(2),
      minWidth: '120px',
      borderRight: `1px solid ${theme.palette.action.hover}`
    }
  },
  periodBoxTitle: {
    marginBottom: theme.spacing(2)
  },
  periodItem: {
    justifyContent: 'center',
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.hover
    }
  },
  dateButton: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minWidth: '180px'
  },
  dateLabel: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  fixedWidth: {
    flex: 0
  },
  popper: {
    zIndex: 10
  }
}));

export default injectIntl(DateInput);
