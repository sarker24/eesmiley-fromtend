import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import {
  CalendarDate,
  CalendarPeriod,
  DateChange,
  DateSelectionChange,
  DEFAULT_FORMAT,
  parsePeriodDate,
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

const DatePickerController: React.FunctionComponent<DatePickerProps & InjectedIntlProps> = (
  props
) => {
  const { intl, fullWidth, className, periodFormat, size, onDateChange, ...sharedProps } = props;

  const handleDateChange = (dateChange: DateSelectionChange) => {
    onDateChange(
      parsePeriodDate({
        date: dateChange.date,
        period: sharedProps.period,
        isoWeek: sharedProps.isoWeek
      })
    );
  };

  return (
    <Calendar
      {...sharedProps}
      views={ViewsPerPeriod[sharedProps.period]}
      onDateChange={handleDateChange}
    />
  );
};

DatePickerController.defaultProps = {
  isoWeek: true,
  disableFutureDates: true,
  showWeekNumbers: true,
  fullWeeks: true,
  periodFormat: DEFAULT_FORMAT,
  size: 'medium',
  rangeSelection: false
};

export default injectIntl(DatePickerController);
