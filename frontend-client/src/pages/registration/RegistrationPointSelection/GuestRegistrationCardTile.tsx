import { GridListTile } from 'registration/ResponsiveGridList';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { makeStyles, Theme } from '@material-ui/core';
import guestRegisterImage from 'static/img/add-guest-registration.png';

const teal5 = '#f4fafa';

interface GuestRegistrationCardTile extends InjectedIntlProps {
  isSelected: boolean;
  onSelectGuestRegistration: () => void;
}

const GuestRegistrationTile: React.FunctionComponent<GuestRegistrationCardTile> = (props) => {
  const classes = styles(props);
  const { onSelectGuestRegistration, isSelected, intl, ...styleProps } = props;

  return (
    <GridListTile
      {...styleProps}
      name={intl.messages['addNewGuestRegistration']}
      image={guestRegisterImage}
      value={intl.messages['addNewGuestRegistration']}
      onClick={onSelectGuestRegistration}
      isSelected={isSelected}
      className={classes.tile}
    />
  );
};

const styles = makeStyles<Theme, GuestRegistrationCardTile>({
  tile: {
    '& > *': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: teal5,
      padding: '20px 20px 50px 20px'
    },
    '& img': {
      position: 'static',
      transform: 'none',
      width: '70% !important',
      height: 'auto !important'
    }
  }
});

export default injectIntl(GuestRegistrationTile);
