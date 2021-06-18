import * as React from 'react';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Box, List, ListItem, Paper, Typography } from '@material-ui/core';

import {
  CalendarDate,
  CalendarPeriod,
  DateChange,
  DateSelection,
  DEFAULT_FORMAT
} from 'DatePicker/utils/constants';
import DateRangeController from 'DatePicker/DateRangeController';
import DatePickerController from 'DatePicker/DatePickerController';

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

type DraftState = {
  period: CalendarPeriod;
  selection?: DateSelection;
  openToDate: CalendarDate;
};

function initOpenToDate(openToDate: CalendarDate, selection: DateSelection): CalendarDate {
  if (openToDate) {
    return openToDate;
  }

  if (selection && (selection.from || selection.to)) {
    return selection.from || selection.to;
  }

  return moment();
}

const DatePicker: React.FunctionComponent<DatePickerProps & InjectedIntlProps> = (props) => {
  const classes = useStyles(props);
  const {
    intl,
    fullWidth,
    className,
    periodFormat,
    size,
    period,
    periods,
    selection,
    openToDate,
    ...sharedProps
  } = props;
  const [draft, setDraft] = React.useState<DraftState>({
    period,
    selection,
    openToDate: initOpenToDate(openToDate, selection)
  });

  React.useEffect(() => {
    if (
      draft.period !== period ||
      !draft.selection ||
      !draft.selection.from.isSame(selection.from, 'day') ||
      !draft.selection.to.isSame(selection.to, 'day')
    ) {
      setDraft({ period, selection, openToDate: initOpenToDate(openToDate, selection) });
    }
  }, [period, selection.from, selection.to]);

  const handleChangePeriod = (event, nextPeriod: CalendarPeriod) => {
    if (nextPeriod === period) {
      setDraft({ period: nextPeriod, selection, openToDate: initOpenToDate(null, selection) });
    } else {
      setDraft({
        period: nextPeriod,
        selection: undefined,
        openToDate: initOpenToDate(null, selection)
      });
    }
  };

  const handleSelectionChange = (date: DateChange) => {
    setDraft((prev) => ({ ...prev, selection: { from: date.from, to: date.to } }));
    sharedProps.onDateChange(date);
  };

  return (
    <Paper className={classes.paper}>
      <Box className={classes.periodBox}>
        <Typography className={classes.periodBoxTitle} align={'center'} variant='h5'>
          {intl.messages['project.timeline.period']}
        </Typography>
        <List disablePadding>
          {periods.map((period) => (
            <ListItem
              className={classes.periodItem}
              selected={period === draft.period}
              key={period}
              onClick={(e) => handleChangePeriod(e, period)}
              button
            >
              {intl.messages[period].toLowerCase()}
            </ListItem>
          ))}
        </List>
      </Box>
      {draft.period === CalendarPeriod.custom ? (
        <DateRangeController
          {...sharedProps}
          selection={draft.selection}
          onDateChange={handleSelectionChange}
          date={draft.openToDate}
        />
      ) : (
        <DatePickerController
          {...sharedProps}
          date={draft.openToDate}
          onDateChange={handleSelectionChange}
          selection={draft.selection}
          period={draft.period}
        />
      )}
    </Paper>
  );
};

DatePicker.defaultProps = {
  isoWeek: true,
  periods: Object.values(CalendarPeriod),
  disableFutureDates: true,
  showWeekNumbers: true,
  fullWeeks: true,
  periodFormat: DEFAULT_FORMAT,
  size: 'medium'
};

const useStyles = makeStyles((theme) => ({
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
  fixedWidth: {
    flex: 0
  }
}));

export default injectIntl(DatePicker);
