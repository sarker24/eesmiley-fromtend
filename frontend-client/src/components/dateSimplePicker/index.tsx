import { RootState } from 'redux/rootReducer';
import * as React from 'react';
import { connect } from 'react-redux';
import { IconButton } from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import { default as momentLib, Moment } from 'moment';
import { extendMoment } from 'moment-range';
import classNames from 'classnames';
import _chunk from 'lodash/chunk';
import './index.scss';

interface StateProps {
  locale: string;
}

export interface OwnProps {
  currentDate: Moment;
  changeMonthHandler: (month: Moment) => void;
  changeDayHandler: (day: Moment) => void;
  range?: boolean;
  endDate?: Moment;
  className?: string | [string];
  wrapperClassName?: string | [string];
  dayClassObjectFunction?: (day: Moment) => { [className: string]: boolean };
}

export interface IComponentState {
  startWeek: any;
  endWeek: any;
  weekDays: string[];
  calendar: ICalendarObject[];
  endDate?: Moment;
  today: Moment;
}

export interface ICalendarObject {
  week: number;
  days: Moment[];
}

type SimpleDatePickerProps = StateProps & OwnProps;

export class SimpleDatePicker extends React.Component<SimpleDatePickerProps, IComponentState> {
  dateTimeFormat: typeof Intl.DateTimeFormat;

  constructor(props: SimpleDatePickerProps) {
    super(props);
    this.state = this.getPopulatedStateForCalendar(props);
    this.dateTimeFormat = Intl.DateTimeFormat;
  }

  UNSAFE_componentWillReceiveProps(nextProps: SimpleDatePickerProps) {
    this.setState(Object.assign({}, this.state, this.getPopulatedStateForCalendar(nextProps)));
  }

  getPopulatedStateForCalendar(props: SimpleDatePickerProps) {
    const moment = extendMoment(momentLib as any);
    if (moment.locale() !== props.locale) {
      // Sanity check for right locale...
      moment.locale(props.locale);
    }
    const startMonth = moment(props.currentDate).startOf('month');
    const endMonth = moment(props.currentDate).endOf('month');

    const startWeekOfMonth = startMonth.startOf('week');
    const endWeekOfMonth = endMonth.endOf('week');

    const wholeMonth = moment.range(startWeekOfMonth, endWeekOfMonth);

    const daysArray = Array.from(wholeMonth.by('day'));
    const month = _chunk(daysArray, 7);

    const calendar = month.map((days) => ({
      week: days[0].week(),
      days
    }));

    return {
      calendar: calendar,
      startWeek: startWeekOfMonth.week(),
      endWeek: endWeekOfMonth.week(),
      weekDays: moment.weekdays(true),
      endDate: moment(props.endDate),
      today: moment(new Date()).startOf('day')
    };
  }

  proxyFunction(day: Moment, handler: (day: Moment) => { [className: string]: boolean }) {
    return handler ? handler(day) : {};
  }

  formatDays(day: Moment, locale: string) {
    return new this.dateTimeFormat(locale, {
      day: 'numeric'
    })
      .format(day.toDate())
      .replace('.', '');
  }

  render() {
    const {
      className,
      wrapperClassName,
      currentDate,
      endDate,
      range,
      changeMonthHandler,
      changeDayHandler,
      dayClassObjectFunction,
      locale
    } = this.props;
    const { weekDays, today } = this.state;

    const wrapperClassNames = classNames('simpleCalendar', [wrapperClassName]);

    const calendarClassName = classNames('calendar', [className]);

    const moment = extendMoment(momentLib as any);

    return (
      <div className={wrapperClassNames}>
        <div className='simpleCalendarHeader'>
          <h2>{`${currentDate.format('MMMM YYYY')}`}</h2>
          <IconButton
            onClick={() => {
              const prevMonth = moment(currentDate).subtract(1, 'month');
              changeMonthHandler(prevMonth);
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => {
              const nextMonth = moment(currentDate).add(1, 'month');
              changeMonthHandler(nextMonth);
            }}
          >
            <ChevronRight />
          </IconButton>
        </div>
        <table className={calendarClassName}>
          <thead className='calendarHead'>
            <tr className='calendarHeadRow'>
              {weekDays.map((weekDay: string, index: number) => {
                return (
                  <td key={`${weekDay}_${index}`} className='calendarHeadCell'>
                    {weekDay.charAt(0).toUpperCase() + weekDay.slice(1, 1)}
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {this.state.calendar.map((calObj: ICalendarObject, index: number) => {
              return (
                <tr className='week' key={`week_${calObj.week}_${index}`}>
                  {calObj.days.map((day: Moment) => {
                    const dayClass = classNames(
                      'day',
                      {
                        today: day.diff(today) === 0,
                        notCurrentMonth: day.month() !== currentDate.month(),
                        selectedDate: day.format('DDMMYYYY') === currentDate.format('DDMMYYYY'),
                        selectedEndDate: range
                          ? day.format('DDMMYYYY') === endDate.format('DDMMYYYY')
                          : false
                      },
                      this.proxyFunction(day, dayClassObjectFunction)
                    );
                    return (
                      <td
                        onClick={() => {
                          changeDayHandler(day);
                        }}
                        className={dayClass}
                        key={day.format('DD')}
                      >
                        <div className={'selectEffect'}></div>
                        <div className={'day'}>{this.formatDays(day, locale)}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect<StateProps, unknown, OwnProps>((state: RootState) => ({
  locale: state.ui.locale === 'phraseapp' ? 'en' : state.ui.locale
}))(SimpleDatePicker);
