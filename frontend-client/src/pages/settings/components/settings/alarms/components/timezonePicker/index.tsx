import * as React from 'react';
import moment from 'moment-timezone';
import { MenuItem, Select } from '@material-ui/core';

interface TimezonePickerProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>, child: React.ReactNode) => void;
}

interface TimeZone {
  name: string;
  value: string;
}

interface TimezonePickerState {
  timezones: TimeZone[];
}

class TimezonePicker extends React.Component<TimezonePickerProps, TimezonePickerState> {
  constructor(props: TimezonePickerProps) {
    super(props);

    this.state = {
      timezones: this.getTimezones()
    };
  }

  getTimezones = (): TimeZone[] => {
    return moment.tz
      .names()
      .filter((zone) => zone.includes('Europe'))
      .map((zone: string) => {
        return {
          name: zone + ' (' + moment.tz(zone).format('Z') + ')',
          value: zone
        };
      });
  };

  getOptions = (): React.ReactElement[] => {
    return this.state.timezones.map((option, index: number) => {
      return (
        <MenuItem key={index} value={option.value}>
          {option.name}
        </MenuItem>
      );
    });
  };

  componentDidMount() {
    this.setState({
      timezones: this.getTimezones()
    });
  }

  render() {
    const { onChange, value } = this.props;
    return (
      <div className='zonePicker'>
        <Select fullWidth={true} value={value} className='selectField' onChange={onChange}>
          {this.getOptions()}
        </Select>
      </div>
    );
  }
}

export default TimezonePicker;
