import { InjectedIntl, injectIntl } from 'react-intl';
import * as React from 'react';
import { Button } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button/Button';

interface IComponentProps extends ButtonProps {
  intl: InjectedIntl;
}

const Component = ({ intl, ...rest }: IComponentProps) => {
  return (
    <Button
      className={'registrationButton'}
      type={'submit'}
      color='primary'
      variant='contained'
      {...rest}
    >
      {intl.messages['registration.btn']}
    </Button>
  );
};

export default injectIntl(Component);
