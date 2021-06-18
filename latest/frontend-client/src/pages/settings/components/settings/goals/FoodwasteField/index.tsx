import { FormControlLabel, InputAdornment, MenuItem, Select } from '@material-ui/core';
import NumberInput from 'input/number';
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { WasteAmount, FoodwastePeriod } from 'redux/ducks/settings';
import { NumberFormatValues } from 'react-number-format';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { isNumeric } from 'utils/math';
import { MassUnit, transformAmount } from 'utils/number-format';

const useStyles = makeStyles({
  root: {
    border: 'none',
    display: 'flex'
  },
  form: {
    margin: 0
  },
  formGrow: {
    flex: 1,
    margin: 0
  },
  formLabel: {
    marginRight: 'auto',
    fontWeight: 600
  },
  formLabelInline: {
    margin: '0 12px'
  },
  formInput: {
    maxWidth: '100px'
  },
  selectPeriod: {
    width: '90px'
  },
  selectPeriodWrapper: {
    width: '120px'
  }
});

export interface FoodwasteFieldProps {
  name?: string;
  label: string;
  value: WasteAmount;
  onChange: (value: WasteAmount) => void;
  as?: MassUnit;
}

type OwnProps = InjectedIntlProps & FoodwasteFieldProps;

const Periods = ['day', 'week', 'month', 'year'] as const;

const FoodwasteField: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const { intl, label, name, value, onChange, as = 'g' } = props;
  const amountValue = isNumeric(value.amount)
    ? transformAmount(value.amount, { unit: value.unit, as })
    : '';

  const handleWasteChange = (values: NumberFormatValues) => {
    const { floatValue } = values;
    onChange({
      ...value,
      amount: transformAmount(floatValue, { unit: as, as: value.unit })
    });
  };
  const handlePeriodChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { value: period } = e.target;
    onChange({ ...value, period: period as FoodwastePeriod });
  };

  return (
    <fieldset className={classes.root}>
      <FormControlLabel
        classes={{
          root: classes.formGrow,
          label: classes.formLabel
        }}
        labelPlacement='start'
        control={
          <NumberInput
            className={classes.formInput}
            decimalScale={2}
            allowNegative={false}
            name={name}
            value={amountValue}
            InputProps={{
              endAdornment: <InputAdornment position='end'>{as}</InputAdornment>
            }}
            onValueChange={handleWasteChange}
          />
        }
        label={label}
      />

      <div className={classes.selectPeriodWrapper}>
        {value.period !== 'fixed' && (
          <FormControlLabel
            classes={{
              root: classes.form,
              label: classes.formLabelInline
            }}
            labelPlacement='start'
            control={
              <Select
                value={value.period}
                onChange={handlePeriodChange}
                className={classes.selectPeriod}
              >
                {Periods.map((period) => (
                  <MenuItem key={period} value={period}>
                    {intl.messages[`report.filter_${period}`]}
                  </MenuItem>
                ))}
              </Select>
            }
            label='/'
          />
        )}
      </div>
    </fieldset>
  );
};
export default injectIntl(FoodwasteField);
