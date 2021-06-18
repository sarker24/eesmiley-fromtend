import { DateRangePickerShape, DateRangePicker } from 'react-dates';
import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';

const momentPropTypes = require('react-moment-proptypes');
import moment from 'moment';

require('react-dates/lib/css/_datepicker.css');
require('./index.scss');

export interface OwnProps {
  startDate: moment.Moment;
  endDate: moment.Moment;
}

type DateRangePickerCustomProps = InjectedIntlProps & DateRangePickerShape & OwnProps;

class DateRangePickerCustom extends React.Component<DateRangePickerCustomProps> {

  static propTypes = {
    startDate: momentPropTypes.momentObj,
    endDate: momentPropTypes.momentObj
  };

  componentDidMount() {
    const { startDate, endDate, intl } = this.props;

    // Update the locale for the startDate moment object if the global locale has been changed
    if (startDate != null && intl.locale != startDate.locale()) {
      startDate.locale(intl.locale);
    }

    // Update the locale for the endDate moment object if the global locale has been changed
    if (endDate != null && intl.locale != endDate.locale()) {
      endDate.locale(intl.locale);
    }
  }

  render() {
    const { intl, ...rest } = this.props;

    return (
      <div>
        <DateRangePicker
          {...rest}
        />
      </div>
    );
  }
}

export default injectIntl(DateRangePickerCustom);
