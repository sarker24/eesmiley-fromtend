import * as React from 'react';
import SelectField from 'material-ui/SelectField';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import DateRangePickerWrapper from './components/dateRangePickerWrapper';
import ChevronLeftIcon from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRightIcon from 'material-ui/svg-icons/navigation/chevron-right';
import IconButton from 'material-ui/IconButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment';
import TabSwitcher from '../tabSwitcher';
import { API_DATE_FORMAT } from 'utils/datetime';
import { unitOfTime } from 'moment';

require('./index.scss');

export interface IComponentProps {
  from: string;
  to: string;
  interval: string;
  dateRangePickerProps?: any;
  onDateChange: Function;
  required?: boolean;
  withIntervalSwitcher?: boolean;
  withIntervalSelector?: boolean;
}

export const intervals = ['day', 'week', 'month', 'year'];

interface TimeFilterState {
  nextDisabled: boolean;
  focusedInput?: any;
}

class TimeFilter extends React.Component<IComponentProps & InjectedIntlProps, TimeFilterState> {
  static defaultProps = {
    required: false
  };

  constructor(props) {
    super(props);

    this.state = {
      nextDisabled: true
    };

    this.onIntervalChange = this.onIntervalChange.bind(this);
    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.onNextInterval = this.onNextInterval.bind(this);
    this.onPreviousInterval = this.onPreviousInterval.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { interval, from } = nextProps;
    const isoInterval = interval == 'week' ? 'isoWeek' : interval;
    let startDate = moment(from, API_DATE_FORMAT).add(1, interval);
    let endDate = startDate.clone().endOf(isoInterval);
    if (endDate.isAfter(moment())) {
      endDate = moment().endOf('day');
    }
    // Cannot increment further than
    this.setState({
      nextDisabled: moment().isBefore(startDate)
    });
  }

  onDatesChange(dates: { startDate: string; endDate: string }, custom?: boolean) {
    const { interval, onDateChange } = this.props;
    let startDate = moment(dates.startDate, API_DATE_FORMAT).add(1, interval as unitOfTime.Base);
    // Cannot increment further than
    this.setState({
      nextDisabled: moment().isBefore(startDate)
    });

    onDateChange({
      from: dates.startDate,
      to: dates.endDate,
      interval: custom ? null : this.props.interval
    });
  }

  async onIntervalChange(event, index, interval: string) {
    const { from, onDateChange } = this.props;
    const isoInterval = interval == 'week' ? 'isoWeek' : (interval as unitOfTime.StartOf);
    let startDate =
      from == null
        ? moment().startOf(isoInterval)
        : moment(from, API_DATE_FORMAT).startOf(isoInterval);
    let endDate = startDate.clone().endOf(isoInterval);
    // Cannot increment further than
    if (moment().isBefore(endDate)) {
      startDate = moment().startOf(isoInterval);
      endDate = moment().endOf('day');
    }

    onDateChange({
      from: startDate.format(API_DATE_FORMAT),
      to: endDate.format(API_DATE_FORMAT),
      interval
    });
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  onNextInterval() {
    const { from, to, interval } = this.props;

    let startDate;
    let endDate;

    if (interval == null) {
      endDate = moment(to, API_DATE_FORMAT);
      startDate = moment(from, API_DATE_FORMAT);
      const days = endDate.diff(startDate, 'days') + 1;
      startDate = startDate.add(days, 'days');
      endDate = endDate.add(days, 'days');
      // Cannot increment further than
      if (moment().isBefore(endDate)) {
        startDate = moment().subtract(days, 'days');
        endDate = moment().endOf('day');
      }
    } else {
      const isoInterval = interval == 'week' ? 'isoWeek' : (interval as unitOfTime.StartOf);
      startDate = moment(from, API_DATE_FORMAT).add(1, interval as unitOfTime.Base);
      endDate = startDate.clone().endOf(isoInterval);
      // Cannot increment further than
      if (moment().isBefore(endDate)) {
        startDate = moment().startOf(isoInterval);
        endDate = moment().endOf('day');
      }
    }
    this.onDatesChange({
      startDate: startDate.format(API_DATE_FORMAT),
      endDate: endDate.format(API_DATE_FORMAT)
    });
  }

  onPreviousInterval() {
    const { from, to, interval } = this.props;

    let startDate;
    let endDate;

    if (interval == null) {
      endDate = moment(to, API_DATE_FORMAT);
      startDate = moment(from, API_DATE_FORMAT);
      const days = endDate.diff(startDate, 'days') + 1;
      startDate = startDate.subtract(days, 'days');
      endDate = endDate.subtract(days, 'days');
    } else {
      const isoInterval = interval == 'week' ? 'isoWeek' : interval;
      startDate = moment(from, API_DATE_FORMAT).subtract(1, interval as unitOfTime.Base);
      endDate = startDate.clone().endOf(isoInterval);
    }

    this.onDatesChange({
      startDate: startDate.format(API_DATE_FORMAT),
      endDate: endDate.format(API_DATE_FORMAT)
    });
  }

  renderIntervalSwitcher() {
    const { intl, interval } = this.props;

    return (
      <div className='timeFilterIntervalSwitcher'>
        <TabSwitcher
          value={interval}
          placeholder={intl.messages['custom']}
          onChange={(value) => {
            this.onIntervalChange(null, null, value);
          }}
        >
          {intervals.map((interval, index) => (
            // @ts-ignore
            <span key={index} value={interval}>
              {intl.messages[`report.filter_${interval}`]}
            </span>
          ))}
        </TabSwitcher>
      </div>
    );
  }

  render() {
    const {
      intl,
      from,
      to,
      interval,
      onDateChange,
      dateRangePickerProps,
      required,
      withIntervalSwitcher,
      withIntervalSelector,
      ...rest
    } = this.props;
    const { nextDisabled } = this.state;

    return (
      <div className='timeFilter'>
        {withIntervalSwitcher && this.renderIntervalSwitcher()}
        <Toolbar className='timeFilterToolbar' style={{ background: 'transparent' }} {...rest}>
          <ToolbarGroup>
            <IconButton
              onClick={this.onPreviousInterval}
              disabled={from == null && to == null}
              className='timeFilterNavBtn'
              iconStyle={{ width: 32, height: 32 }}
              style={{ width: 52, height: 52, padding: 6 }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </ToolbarGroup>
          <div className='timeFilterInner'>
            <ToolbarGroup className='timeFilterMainGroup dateRangeFilter'>
              <DateRangePickerWrapper
                required={required}
                startDate={from}
                endDate={to}
                onChange={(dates) => {
                  this.onDatesChange(dates, true);
                }}
                dateRangePickerProps={dateRangePickerProps}
              />
            </ToolbarGroup>
            <div className='timeFilterSelectors'>
              {withIntervalSelector && (
                <ToolbarGroup className='timeFilterMainGroup'>
                  <SelectField
                    className='intervalSelector'
                    labelStyle={{ paddingLeft: 12 }}
                    floatingLabelStyle={{ paddingLeft: 12, top: 36 }}
                    autoWidth={true}
                    value={interval}
                    onChange={this.onIntervalChange}
                    floatingLabelText={intl.messages['dates.timeRange']}
                  >
                    <MenuItem value={'day'} primaryText={intl.messages['report.filter_day']} />
                    <MenuItem value={'week'} primaryText={intl.messages['report.filter_week']} />
                    <MenuItem value={'month'} primaryText={intl.messages['report.filter_month']} />
                    <MenuItem value={'year'} primaryText={intl.messages['report.filter_year']} />
                  </SelectField>
                </ToolbarGroup>
              )}
            </div>
          </div>
          <ToolbarGroup>
            <IconButton
              onClick={this.onNextInterval}
              className='timeFilterNavBtn'
              iconStyle={{ width: 32, height: 32 }}
              disabled={nextDisabled || (from == null && to == null)}
              style={{ width: 52, height: 52, padding: 6 }}
            >
              <ChevronRightIcon />
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }
}

export default injectIntl(TimeFilter);
