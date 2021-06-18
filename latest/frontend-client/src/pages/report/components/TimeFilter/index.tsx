import * as React from 'react';

import { connect } from 'react-redux';
import { Period, ReportActions, TimeRange } from 'redux/ducks/reports-new';
import * as reportDispatch from 'redux/ducks/reports-new';
import { CalendarPeriod, DateChange } from 'DatePicker/utils/constants';
import { API_DATE_FORMAT } from 'utils/datetime';
import { DateInput } from 'DatePicker';
import { getTimeFilter } from 'redux/ducks/reports-new/selectors';
import moment from 'moment';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { DatePickerProps } from 'DatePicker/DateInput';

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface TimeFilterContainerProps extends Partial<DatePickerProps> {
  className?: string;
  skipFilterReload?: boolean;
  updateCache?: boolean;
}

const TimeFilterContainer: React.FunctionComponent<
  TimeFilterContainerProps & StoreProps & DispatchProps
> = (props) => {
  const { timeFilter, changeTime, skipFilterReload, updateCache, ...restProps } = props;
  const period = CalendarPeriod[timeFilter.period];
  const from = moment(timeFilter.from);
  const to = moment(timeFilter.to);
  const handleDateChange = (dateChange: DateChange) => {
    const timeRange = {
      from: dateChange.from.format(API_DATE_FORMAT),
      to: dateChange.to.format(API_DATE_FORMAT)
    };

    changeTime(timeRange, dateChange.type as Period, { skipFilterReload, updateCache });
  };

  return (
    <DateInput
      periods={[
        CalendarPeriod.day,
        CalendarPeriod.week,
        CalendarPeriod.month,
        CalendarPeriod.quarter,
        CalendarPeriod.year,
        CalendarPeriod.custom
      ]}
      isoWeek={true}
      size='medium'
      {...restProps}
      onDateChange={handleDateChange}
      selection={{ from, to }}
      period={period}
    />
  );
};

const mapStateToProps = (state: RootState) => ({
  timeFilter: getTimeFilter(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  changeTime: (range: TimeRange, period: Period, options) =>
    dispatch(reportDispatch.changeTimeRange(range, period, options))
});

export default connect<StoreProps, DispatchProps, TimeFilterContainerProps>(
  mapStateToProps,
  mapDispatchToProps
)(TimeFilterContainer);
