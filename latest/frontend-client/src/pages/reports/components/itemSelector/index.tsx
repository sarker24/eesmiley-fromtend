import * as React from 'react';
import MenuItem from 'material-ui/MenuItem';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { FormControl, InputLabel, Select } from '@material-ui/core';

interface OwnProps {
  selected: any[];
  handler: Function;
  options: any[];
  floatingLabelText?: string;
  name?: string;
  disabled?: boolean;
  optionIdKey?: string;
  defaultName?: string;
  required?: boolean;
  onBlur?: any;
  className?: string;
}

type ItemSelectorProps = OwnProps & InjectedIntlProps;

class ItemSelector extends React.Component<ItemSelectorProps, {}> {

  public static defaultProps = {
    optionIdKey: 'id',
    required: false
  };

  renderItems(selected: { id: number|string }[]) {
    const { options, optionIdKey, defaultName } = this.props;

    return options.map((item) => (
        <MenuItem
          key={item[optionIdKey]}
          insetChildren={true}
          checked={selected && selected.some((value) => {

            return String(value) == String(item[optionIdKey]);
          })}
          disabled={item['disabled']}
          value={item[optionIdKey]}
          primaryText={item.name || defaultName}
        />
      )
    );
  }

  render() {
    const { selected, handler, intl, floatingLabelText, name, disabled, onBlur, className, options, optionIdKey, defaultName, required } = this.props;
    return (
      <FormControl size='small' className={className + ' ' + (options.length <= 0 ? 'disabled' : '')}>
        <InputLabel htmlFor={'item-selector-' + (name ? name : '') }>{floatingLabelText}</InputLabel>
        <Select
          required={required}
          multiple={true}
          renderValue={(value: {}[]) => {

            if (value.length > 0 && value[0] == 'all') {
              return intl.messages['report.filter.no_selection'];
            }

            return options.filter(option => {
              return selected.indexOf(option[optionIdKey]) > -1;
            }).map((option: { name: string }) => {
              return option.name || defaultName;
            }).join(', ');
          }}
          value={selected && selected.length > 0 ? selected : ['all']}
          disabled={disabled}
          onBlur={onBlur}
          onChange={(e) => {
            let values: string[] = e.target.value as string[] || [];
            if (values && values.length > 0 && values[values.length - 1] == 'all') {
              handler([]);
            } else {
              const allIndex = values.indexOf('all');
              if (allIndex > -1) {
                values.splice(allIndex, 1);
              }
              handler(values);
            }
          }}
        >
          <MenuItem
            key='no_selection'
            insetChildren={true}
            checked={(!selected || selected.length == 0)}
            primaryText={intl.messages['report.filter.no_selection']}
            value='all'
          />
          {this.renderItems(selected)}
        </Select>
      </FormControl>
    );
  }
}

export default injectIntl(ItemSelector);
