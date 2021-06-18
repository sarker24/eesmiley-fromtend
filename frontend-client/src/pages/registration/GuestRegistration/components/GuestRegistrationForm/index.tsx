import * as React from 'react';
import KeyPad from 'components/keypad';
import { API_DATE_FORMAT } from 'utils/datetime';
import { Button, makeStyles, Theme } from '@material-ui/core';
import { CreateGuestRegistration } from 'redux/ducks/guestRegistrations/types';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import InlineDatePicker from 'InlineDatePicker';

interface GuestRegistrationFormProps extends InjectedIntlProps {
  className: string;
  guestRegistration?: Partial<CreateGuestRegistration>;
  options?: {
    date?: {
      enabled: boolean;
    };
    keypad?: {
      enabled: boolean;
      label?: React.ReactNode;
    };
  };

  onChange: (data: Partial<CreateGuestRegistration>) => void;

  onSubmit: (data: CreateGuestRegistration) => void;
}

const GuestRegistrationForm: React.FunctionComponent<GuestRegistrationFormProps> = (
  props: GuestRegistrationFormProps
) => {
  const { onChange, onSubmit, guestRegistration, className, options, intl } = props;
  const { amount, date } = guestRegistration;

  const classes = styles(props);

  function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    onSubmit(guestRegistration as CreateGuestRegistration);
  }

  function handleDateChange(date: Moment) {
    onChange({ ...guestRegistration, date: date.format(API_DATE_FORMAT) });
  }

  function handleAmountChange(amount: number) {
    onChange({ ...guestRegistration, amount });
  }

  return (
    <div className={classNames(classes.root, { [className]: !!className })}>
      <InlineDatePicker
        className={classes.calendar}
        value={moment(date)}
        onChange={handleDateChange}
      />
      <KeyPad
        label={options.keypad.label}
        onChange={handleAmountChange}
        disabled={!options.keypad.enabled}
        value={amount}
      />
      <Button
        color='primary'
        variant='contained'
        className={classes.button}
        onClick={handleSubmit}
        disabled={!amount}
      >
        {intl.messages['registration.btn']}
      </Button>
    </div>
  );
};

GuestRegistrationForm.defaultProps = {
  options: {
    date: { enabled: true },
    keypad: {
      enabled: true
    }
  }
};

const fixedHeightQuery = '@media screen and (min-height: 1024px)';

const styles = makeStyles<Theme, GuestRegistrationFormProps>((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between',
    backgroundColor: '#333333',
    padding: '2vh',
    height: '100%',
    '& > * + * ': {
      marginTop: '2vh'
    },
    [fixedHeightQuery]: {
      padding: '16px',
      '& > * + * ': {
        marginTop: '16px'
      }
    }
  },
  button: {
    width: '100%',
    borderRadius: '5px!important',
    marginBottom: 'auto'
  },
  calendar: {
    backgroundColor: '#595959',
    '& .MuiButton-root': {
      color: theme.palette.common.white,
      fill: theme.palette.common.white
    }
  }
}));

export default injectIntl(GuestRegistrationForm);
