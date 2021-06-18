import * as React from 'react';
import DateRangePicker from 'reports/components/date-range-picker';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import EventIcon from 'material-ui/svg-icons/action/event';
import Subheader from 'material-ui/Subheader';
import DropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { API_DATE_FORMAT } from 'utils/datetime';

require('./index.scss');

export interface IComponentProps {
  dateRangePickerProps?: any;
  startDate: string|null;
  endDate: string|null;
  required?: boolean;
  onChange?: any;
}

export interface IComponentState {
  startDate: moment.Moment|null;
  endDate: moment.Moment|null;
  focusedInput: string|null;
}

const Sub: React.FunctionComponent<any> = props => <Subheader { ...props } />;


class DateRangePickerWrapper extends React.Component<IComponentProps & InjectedIntlProps, IComponentState> {

  static defaultProps = {
    startDate: moment().format(API_DATE_FORMAT),
    endDate: moment().format(API_DATE_FORMAT),
    required: false
  };

  constructor(props) {
    super(props);

    this.state = {
      focusedInput: null,
      startDate: props.startDate ? moment(props.startDate, API_DATE_FORMAT) : null,
      endDate: props.endDate ? moment(props.endDate, API_DATE_FORMAT) : null
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onDatesChange(dates: { startDate, endDate }) {
    const { onChange } = this.props;
    if (onChange && dates.startDate != null && dates.endDate != null) {

      onChange({
        startDate: dates.startDate.format(API_DATE_FORMAT),
        endDate: dates.endDate.format(API_DATE_FORMAT)
      });
    }

    this.setState({
      startDate: dates.startDate,
      endDate: dates.endDate
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.startDate !== undefined) {
      this.setState({
        startDate: nextProps.startDate ? moment(nextProps.startDate, API_DATE_FORMAT) : null
      });
    }
    if (nextProps.endDate  !== undefined) {
      this.setState({
        endDate: nextProps.endDate ? moment(nextProps.endDate, API_DATE_FORMAT) : null
      });
    }
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  render() {

    const { focusedInput } = this.state;
    const { intl, required, startDate, endDate, dateRangePickerProps } = this.props;


    return (
      <div className='timeFilterDateRangePicker'>
        <Sub className='dateRangeFrom'><span onClick={() => { this.setState({ focusedInput: 'startDate' }); }}>{intl.messages['dates.from']}</span></Sub>
        <Sub className='dateRangeTo' ><span onClick={() => { this.setState({ focusedInput: 'endDate' }); }}>{intl.messages['dates.to']}</span></Sub>
        <DateRangePicker
          startDatePlaceholderText={intl.messages['project.dialog.duration.startDate']}
          endDatePlaceholderText={intl.messages['project.dialog.duration.endDate']}
          isOutsideRange={(day) => moment().endOf('day').isBefore(day)}
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          minimumNights={0}
          required={required}
          noBorder={true}
          withPortal={window.outerWidth < 1024}
          orientation={window.outerWidth < 768 ? 'vertical' : 'horizontal'}
          startDateId='timeFilterStartDate'
          endDateId='timeFilterEndDate'
          hideKeyboardShortcutsPanel={true}
          customInputIcon={<EventIcon/>}
          customArrowIcon={<span></span>}
          {...dateRangePickerProps}
        />
        <DropDownIcon onClick={() => { this.setState({ focusedInput: 'endDate' }); }} className='dropDownIcon'/>
      </div>
    );
  }
}

export default injectIntl(DateRangePickerWrapper);
