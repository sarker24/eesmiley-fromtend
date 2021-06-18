import * as React from 'react';
import { InputLabel, TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { AccountQuery, AccountQueryOp } from 'redux/ducks/reports-new/selectors';

interface RankingFilterProps {
  type: AccountQueryOp.top | AccountQueryOp.bottom;
  accountQuery?: AccountQuery;
  onChange: (queryString: string) => void;
}

const RankingInputProps: { min: number; max: number; step: number } = { max: 9, min: 1, step: 1 };

const RankingFilter: React.FunctionComponent<RankingFilterProps & InjectedIntlProps> = (props) => {
  const classes = useStyles(props);
  const { type, accountQuery, onChange, intl } = props;
  const value = accountQuery && accountQuery.op === type ? +accountQuery.value : '';

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // otherwise accountselector's onSelectionChange is triggered
    e.stopPropagation();
    const value = parseInt(e.target.value);
    // min max on input gets skipped when typing a value
    if (value >= RankingInputProps.min && value <= RankingInputProps.max) {
      onChange(`${type}${value}`);
    }
  };

  return (
    <InputLabel className={classes.root} htmlFor={type + '_' + 'filter'}>
      {intl.messages[`report.filter.${type}`]}
      <TextField
        id={type + '_' + 'filter'}
        className={classes.textField}
        variant='outlined'
        type='number'
        size='small'
        value={value}
        inputProps={RankingInputProps}
        onChange={handleValueChange}
      />
    </InputLabel>
  );
};

// TODO add colors to theme
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    },
    textField: {
      maxWidth: '60px',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main
      }
    }
  })
);

export default injectIntl(RankingFilter);
