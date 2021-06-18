import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Divider, ListItemText, makeStyles } from '@material-ui/core';
import SortIcon from 'icons/sort';
import Select from 'report/components/Select';
import SelectItem from 'report/components/Select/components/SelectItem';

interface GuestTypeSelectProps {
  onChange: (names: string[]) => void;
  available: string[];
  selected: string[];
}

const SelectAll = 'all';

// basically a copy paste of RegistrationPointSelect,
// could be refactored to share logic
const GuestTypeSelect: React.FunctionComponent<GuestTypeSelectProps & InjectedIntlProps> = (
  props
) => {
  const { intl, available, selected, onChange } = props;
  const classes = useStyles(props);
  const renderValue = () => {
    if (selected.length === 0) {
      return intl.messages['report.filter.no_selection'];
    }

    return selected.join(',');
  };

  const handleChange = (e: React.ChangeEvent<any>, value: string, isChecked?: boolean) => {
    if (value === SelectAll || value.length === available.length) {
      onChange([]);
    } else {
      const selectedValues = isChecked
        ? selected.filter((selectedName) => selectedName !== value)
        : [...selected, value];
      onChange(selectedValues);
    }
  };

  return (
    <Select
      renderValue={renderValue}
      buttonProps={{
        fullWidth: true,
        disabled: available.length === 0,
        startIcon: <SortIcon className={classes.icon} />
      }}
      menuProps={{
        MenuListProps: {
          disablePadding: true
        }
      }}
    >
      <SelectItem
        disabled={selected.length === 0}
        selected={selected.length === 0}
        onClick={(e) => handleChange(e, SelectAll)}
        checkbox
      >
        <ListItemText>{intl.messages['report.filter.no_selection']}</ListItemText>
      </SelectItem>
      <Divider />
      {available.map((guestTypeName: string) => {
        const isSelected = selected.some((name) => name === guestTypeName);
        return (
          <SelectItem
            onClick={(e) => handleChange(e, guestTypeName, isSelected)}
            key={guestTypeName}
            selected={isSelected}
            checkbox
          >
            <ListItemText>{guestTypeName}</ListItemText>
          </SelectItem>
        );
      })}
    </Select>
  );
};

const useStyles = makeStyles((theme) => ({
  icon: {
    '& > path:nth-child(2)': {
      color: theme.palette.primary.main
    }
  }
}));

export default injectIntl(GuestTypeSelect);
