import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { NameWithDisableStatus } from 'redux/ducks/reports-new/selectors';
import { Divider, ListItemText, makeStyles } from '@material-ui/core';
import SortIcon from 'icons/sort';
import Select from 'report/components/Select';
import SelectItem from 'report/components/Select/components/SelectItem';

interface RegistrationPointSelectProps {
  label: string;
  onChange: (label: string, names: string[]) => void;
  available: NameWithDisableStatus[];
  selected: string[];
}

const SelectAll = 'all';

const RegistrationPointSelect: React.FunctionComponent<
  RegistrationPointSelectProps & InjectedIntlProps
> = (props) => {
  const { intl, available, selected, onChange, label } = props;
  const classes = useStyles(props);
  const sortIconClass = classes[`${label}Icon` as keyof typeof classes];
  const renderValue = () => {
    if (selected.length === 0) {
      return intl.messages['report.filter.no_selection'];
    }

    return selected.join(',');
  };

  const handleChange = (e: React.ChangeEvent<any>, value: string, isChecked?: boolean) => {
    if (value === SelectAll) {
      onChange(label, []);
    } else {
      const selectedValues = isChecked
        ? selected.filter((selectedName) => selectedName !== value)
        : [...selected, value];
      onChange(label, selectedValues);
    }
  };

  return (
    <Select
      renderValue={renderValue}
      buttonProps={{
        fullWidth: true,
        disabled: available.length === 0,
        startIcon: <SortIcon className={sortIconClass} />
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
      {available.map((point: NameWithDisableStatus) => {
        const isSelected = selected.some((name) => name === point.name);
        return (
          <SelectItem
            onClick={(e) => handleChange(e, point.name, isSelected)}
            key={point.name}
            selected={isSelected}
            disabled={point.disabled}
            checkbox
          >
            <ListItemText>{point.name}</ListItemText>
          </SelectItem>
        );
      })}
    </Select>
  );
};

const useStyles = makeStyles((theme) => ({
  areaIcon: {
    '& > path:nth-child(1)': {
      color: theme.palette.primary.main
    }
  },
  categoryIcon: {
    '& > path:nth-child(2)': {
      color: theme.palette.primary.main
    }
  },
  productIcon: {
    '& > path:nth-child(3)': {
      color: theme.palette.primary.main
    }
  }
}));

export default injectIntl(RegistrationPointSelect);
