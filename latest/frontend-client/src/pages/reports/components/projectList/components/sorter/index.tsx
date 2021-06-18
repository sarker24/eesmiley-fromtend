/**
 * Sorter for Reports module v2
 */

import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import ArrowUpIcon from 'material-ui/svg-icons/navigation/arrow-upward';
import ArrowDownIcon from 'material-ui/svg-icons/navigation/arrow-downward';
import { Menu, MenuItem, Popover, Button } from '@material-ui/core';

const sortingOptions = [
  { value: 'name', key: 'name' },
  { value: 'startDate', key: 'project.dialog.duration.startDate' },
  { value: 'totalAmount', key: 'reports.foodwasteAmount' },
  { value: 'totalCost', key: 'reports.foodwasteCost' },
  { value: 'status', key: 'project.dialog.table.status' },
  { value: 'period', key: 'project.timeline.period' }
];

export interface OwnProps {
  onChange: (sort: any) => void;
  value: {
    key: string;
    ascending: boolean;
  };
}

export interface SorterState {
  open: boolean;
  anchorEl?: any;
}

type SorterProps = OwnProps & InjectedIntlProps;

class Sorter extends React.Component<SorterProps, SorterState> {

  constructor(props: SorterProps) {
    super(props);

    this.state = {
      open: false
    };
  }

  sortHandler(option: { value: string; key: string; }) {
    this.setState({
      open: false
    });

    return this.props.onChange({
      ...this.props.value,
      key: option.value,
      ascending: option.value == this.props.value.key ? !this.props.value.ascending : this.props.value.ascending
    });
  }

  orderHandler() {
    return this.props.onChange({ ...this.props.value, ascending: !this.props.value.ascending });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.value && (nextProps.value.key != this.props.value.key || nextProps.value.ascending != this.props.value.ascending) || nextState.open != this.state.open) {
      return true;
    }

    return false || !nextProps.value;
  }

  render() {

    const { intl, value } = this.props;
    const { open, anchorEl } = this.state;

    let selectedOption = 'N/A';

    for (let i in sortingOptions) {
      if (sortingOptions[i].value == value.key) {
        selectedOption = intl.messages[sortingOptions[i].key];
        break;
      }
    }

    return (
      <div className='sorter' style={{ textAlign: 'right' }}>
        <Button
          onClick={(event) => {
            event.preventDefault();
            this.setState({ open: !open, anchorEl: event.currentTarget });
          }}
        ><span style={{
          fontSize: '12px',
          textTransform: 'none',
          color: '#858585',
          fontWeight: 'normal'
        }}>{intl.messages['sortBy'] + ': ' + selectedOption}</span></Button>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={() => {
            this.setState({ open: false });
          }}
        >
          <Menu open={open}>
            {
              sortingOptions.map((option, i) => (
                <MenuItem key={i} selected={value.key == option.value} onClick={() => {
                  this.sortHandler(option);
                }}>
                  {intl.messages['sortBy'] + ' ' + intl.messages[option.key].toLowerCase()}
                </MenuItem>
              ))
            }
          </Menu>
        </Popover>
        <span onClick={() => {
          this.orderHandler();
        }} style={{ cursor: 'pointer', float: 'right', display: 'block', paddingTop: '8px', paddingBottom: '8px' }}>
          {value.ascending ? <ArrowUpIcon style={{ width: '20px', height: '20px', color: '#858585' }}/> :
            <ArrowDownIcon style={{ width: '20px', height: '20px', color: '#858585' }}/>}
        </span>
      </div>
    );
  }
}

export default injectIntl(Sorter);
