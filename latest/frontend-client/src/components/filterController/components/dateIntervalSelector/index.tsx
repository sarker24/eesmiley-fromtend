import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import { MenuItem, IconButton, Button, Select, InputAdornment } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CalendarIcon from '@material-ui/icons/Event';
import './index.scss';
import { DateFilter } from 'filterController';

export interface OwnProps {
  value: DateFilter;
  weeksEnabled: boolean;
  yearsEnabled: boolean;
  monthsEnabled: boolean;
  onChange: (value: DateFilter) => void;
}

type DateIntervalSelectorProps = OwnProps & InjectedIntlProps;

export class DateIntervalSelector extends React.Component<DateIntervalSelectorProps> {
  shouldComponentUpdate(prevProps: DateIntervalSelectorProps) {
    if (
      this.props.intl.locale != prevProps.intl.locale ||
      this.props.onChange != prevProps.onChange ||
      this.props.value != prevProps.value ||
      this.props.weeksEnabled != prevProps.weeksEnabled ||
      this.props.monthsEnabled != prevProps.monthsEnabled ||
      this.props.yearsEnabled != prevProps.yearsEnabled
    ) {
      return true;
    }

    return false;
  }

  onNextInterval = (): void => {
    const startDate = this.props.value.startDate;
    switch (this.props.value.interval) {
      case 'week': {
        const date = moment(startDate, 'YYYY-MM-DD');
        this.handleIntervalChange('week', date.isoWeek(date.isoWeek() + 1));
        break;
      }
      case 'month':
        this.handleIntervalChange('month', moment(startDate, 'YYYY-MM-DD').add(1, 'months'));
        break;
      case 'year':
        this.handleIntervalChange('year', moment(startDate, 'YYYY-MM-DD').add(1, 'years'));
        break;
    }
  };

  onPreviousInterval = (): void => {
    const startDate = this.props.value.startDate;

    switch (this.props.value.interval) {
      case 'week': {
        const date = moment(startDate, 'YYYY-MM-DD');
        this.handleIntervalChange('week', date.isoWeek(date.isoWeek() - 1));
        break;
      }
      case 'month':
        this.handleIntervalChange('month', moment(startDate, 'YYYY-MM-DD').subtract(1, 'months'));
        break;
      case 'year':
        this.handleIntervalChange('year', moment(startDate, 'YYYY-MM-DD').subtract(1, 'years'));
        break;
    }
  };

  buildDateIntervalSelector = (): JSX.Element => {
    let intervalValueSelector = null;
    let disabled = false;
    switch (this.props.value.interval) {
      case 'week':
        intervalValueSelector = this.buildWeekSelector();
        disabled =
          this.props.value.timeFilter &&
          this.props.value.timeFilter === moment().startOf('isoWeek').format('GGGG.W.DDD');
        break;
      case 'month': {
        intervalValueSelector = this.buildMonthSelector();
        const now = moment();
        disabled =
          this.props.value.timeFilter &&
          this.props.value.timeFilter === `${now.format('YYYY')}.${parseInt(now.format('M')) - 1}`;
        break;
      }
      case 'year':
        intervalValueSelector = this.buildYearSelector();
        disabled =
          this.props.value.timeFilter && this.props.value.timeFilter === moment().format('YYYY');
        break;
    }

    return (
      <div className={'dateIntervalValueContainer'}>
        <IconButton onClick={this.onPreviousInterval}>
          <ChevronLeftIcon />
        </IconButton>
        {intervalValueSelector}
        <IconButton onClick={this.onNextInterval} disabled={disabled}>
          <ChevronRightIcon />
        </IconButton>
      </div>
    );
  };

  buildWeekSelector = (): JSX.Element => {
    let year = moment().isoWeekYear();
    const weekDiffs = moment()
      .startOf('isoWeek')
      .diff(moment(this.props.value.startDate, 'YYYY-MM-DD'), 'weeks');
    const date = moment().startOf('isoWeek');
    const arrayOfWeeks: { value: string; label: string }[] = [];

    while (arrayOfWeeks.length < 52 + weekDiffs) {
      const yearIterator = date.isoWeekYear();
      const weekIterator = date.isoWeek();
      arrayOfWeeks.push({
        value: `${yearIterator}.${weekIterator}.${moment(
          `${yearIterator}-${weekIterator}`,
          'GGGG-W'
        )
          .startOf('isoWeek')
          .format('DDD')}`,
        label: `${this.props.intl.messages['week']} ${weekIterator}, ${yearIterator}`
      });
      date.isoWeek(date.isoWeek() - 1);
      if (date.isoWeekYear() != year) {
        if (arrayOfWeeks.length >= 52 + weekDiffs) {
          break;
        } else {
          year = date.isoWeekYear();
        }
      }
    }

    return (
      <Select
        className='dateIntervalSelectorDropdown'
        value={this.props.value.timeFilter}
        startAdornment={
          <InputAdornment position='start'>
            <CalendarIcon />
          </InputAdornment>
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          this.handleChosenFilterChange(event.target.value);
        }}
      >
        {arrayOfWeeks.map((week) => {
          return (
            <MenuItem value={week.value} key={week.value}>
              {week.label}
            </MenuItem>
          );
        })}
      </Select>
    );
  };

  buildMonthSelector = (): JSX.Element => {
    let monthIterator = parseInt(moment().format('M'));
    const monthDiffs = moment().diff(moment(this.props.value.startDate, 'YYYY-MM-DD'), 'months');
    let yearIterator = moment().year();
    const arrayOfMonths: { value: string; label: string }[] = [];
    for (let i = 0; i <= 24 + monthDiffs; i++) {
      arrayOfMonths.push({
        value: `${yearIterator}.${monthIterator - 1}`,
        label: `${
          this.props.intl.messages[
            `date.months.${moment()
              .locale('en')
              .year(yearIterator)
              .month(monthIterator - 1)
              .format('MMMM')
              .toLowerCase()}`
          ]
        }  ${yearIterator}`
      });
      monthIterator--;
      if (monthIterator === 0) {
        monthIterator = 12;
        yearIterator--;
      }
    }

    return (
      <Select
        className='dateIntervalSelectorDropdown'
        value={this.props.value.timeFilter}
        startAdornment={
          <InputAdornment position='start'>
            <CalendarIcon />
          </InputAdornment>
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          this.handleChosenFilterChange(event.target.value);
        }}
      >
        {arrayOfMonths.map((month) => {
          return (
            <MenuItem value={month.value} key={month.value}>
              {month.label}
            </MenuItem>
          );
        })}
      </Select>
    );
  };

  buildYearSelector = (): JSX.Element => {
    const currentYear = moment().year();
    const yearDiffs = moment().diff(moment(this.props.value.startDate, 'YYYY-MM-DD'), 'years');

    const arrayOfYears: { value: string }[] = [];
    for (let i = 0; i <= 10 + yearDiffs; i++) {
      arrayOfYears.push({
        value: `${currentYear - i}`
      });
    }

    return (
      <Select
        className='dateIntervalSelectorDropdown'
        value={this.props.value.timeFilter}
        startAdornment={
          <InputAdornment position='start'>
            <CalendarIcon />
          </InputAdornment>
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          this.handleChosenFilterChange(event.target.value);
        }}
      >
        {arrayOfYears.map((month) => {
          return (
            <MenuItem value={month.value} key={month.value}>
              {month.value}
            </MenuItem>
          );
        })}
      </Select>
    );
  };

  handleIntervalChange = (chosenInterval: string, chosenDate?: moment.Moment): void => {
    let chosenTimeFilter = null;
    const startDate = chosenDate || moment();

    switch (chosenInterval) {
      case 'week':
        chosenTimeFilter = `${startDate.isoWeekYear()}.${parseInt(
          startDate.format('W')
        )}.${parseInt(startDate.startOf('isoWeek').format('DDD'))}`;
        break;
      case 'month':
        chosenTimeFilter = `${startDate.format('YYYY')}.${parseInt(startDate.format('M')) - 1}`;
        break;
      case 'year':
        chosenTimeFilter = `${startDate.format('YYYY')}`;
        break;
      default:
        break;
    }

    this.handleChosenFilterChange(chosenTimeFilter, chosenInterval);
  };

  handleChosenFilterChange = (chosenTimeFilter: string, interval?: string): void => {
    switch (interval || this.props.value.interval) {
      case 'week':
        this.handleChosenWeekFilterChange(chosenTimeFilter);
        break;
      case 'month':
        this.handleChosenMonthFilterChange(chosenTimeFilter);
        break;
      case 'year':
        this.handleChosenYearFilterChange(chosenTimeFilter);
        break;
      default:
        break;
    }
  };

  handleChosenWeekFilterChange = (chosenTimeFilter: string): void => {
    const yearInterval = chosenTimeFilter.split('.');
    const selectedYear = parseInt(yearInterval[0]);
    const selectedWeek = parseInt(yearInterval[1]);

    const endDate = moment().year(selectedYear).isoWeek(selectedWeek).endOf('isoWeek');
    const startDate = moment().year(selectedYear).isoWeek(selectedWeek).startOf('isoWeek');

    this.props.onChange(
      Object.assign({}, this.props.value, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        timeFilter: chosenTimeFilter,
        interval: 'week'
      })
    );
  };

  handleChosenMonthFilterChange = (chosenTimeFilter: string): void => {
    const yearInterval = chosenTimeFilter.split('.');
    const selectedYear = parseInt(yearInterval[0]);
    const selectedMonth = parseInt(yearInterval[1]);
    const startDate = moment().year(selectedYear).month(selectedMonth).startOf('month');
    const endDate = moment().year(selectedYear).month(selectedMonth).endOf('month');

    this.props.onChange(
      Object.assign({}, this.props.value, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        timeFilter: chosenTimeFilter,
        interval: 'month'
      })
    );
  };

  handleChosenYearFilterChange = (chosenTimeFilter: string): void => {
    const startDate = moment().year(Number(chosenTimeFilter)).startOf('year');
    const endDate = moment().year(Number(chosenTimeFilter)).endOf('year');

    this.props.onChange(
      Object.assign({}, this.props.value, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        timeFilter: chosenTimeFilter,
        interval: 'year'
      })
    );
  };

  render() {
    const { intl, value, weeksEnabled, yearsEnabled, monthsEnabled } = this.props;
    const periodTypes = [];

    if (weeksEnabled) {
      periodTypes.push('week');
    }

    if (monthsEnabled) {
      periodTypes.push('month');
    }

    if (yearsEnabled) {
      periodTypes.push('year');
    }

    return (
      <div className='dateIntervalSelector dateSelector'>
        <div className='dateContainer'>{this.buildDateIntervalSelector()}</div>
        <div className='periodButtonsContainer'>
          {periodTypes.map((element: string, index: number) => (
            <Button
              className={'btn'}
              variant={'contained'}
              color={value.interval === element ? 'primary' : undefined}
              key={`${element}_${index}`}
              onClick={() => this.handleIntervalChange(element as any)}
            >
              {intl.messages[`report.filter_${element}`]}
            </Button>
          ))}
        </div>
      </div>
    );
  }
}

export default injectIntl(DateIntervalSelector);
