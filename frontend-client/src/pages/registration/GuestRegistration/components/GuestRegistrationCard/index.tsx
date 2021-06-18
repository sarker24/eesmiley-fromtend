import { Paper, GridListTile, makeStyles, Theme } from '@material-ui/core';
import classNames from 'classnames';
import * as React from 'react';
import { GuestTypeRegistration } from 'registration/GuestRegistration/types';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { teal35, teal5 } from 'registration/GuestRegistration/styles';

interface GuestRegistrationCardProps extends InjectedIntlProps {
  guestTypeRegistration: GuestTypeRegistration;
  isSelected: boolean;
  onSelectGuestType: (id: number) => void;
}

const GuestRegistrationCard: React.FunctionComponent<GuestRegistrationCardProps> = (props) => {
  const classes = styles(props);
  const { guestTypeRegistration, isSelected, onSelectGuestType, intl, ...gridStyle } = props;
  const { guestType, ...registration } = guestTypeRegistration;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectGuestType(guestType.id);
  };

  return (
    <GridListTile
      className={classes.root}
      key={guestType.name}
      cols={1}
      classes={{ tile: classes.tile }}
      {...gridStyle}
      onClick={handleClick}
    >
      <Paper elevation={2} classes={{ root: classes.paper, elevation2: classes.elevation2 }}>
        <div className={classNames(classes.tileAmountBox, { selected: isSelected })}>
          {registration.amount || '-'}
        </div>
        <div className={classes.tileTitleBar}>
          <span>{guestType.name || intl.messages['guestAmount']}</span>
        </div>
      </Paper>
    </GridListTile>
  );
};

const styles = makeStyles<Theme, GuestRegistrationCardProps>((theme) => ({
  root: {
    border: 0 /* IE11 fix */,
    flexGrow: 1,
    cursor: 'pointer',
    '& > * ': {
      pointerEvents: 'none'
    }
  },
  tile: {
    overflow: 'visible'
  },
  paper: {
    borderRadius: '5px',
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      flexFlow: 'row-reverse nowrap',
      justifyContent: 'flex-end'
    }
  },
  elevation2: {
    boxShadow: '0 1px 6px 0 rgba(0, 0, 0, 0.12)'
  },
  tileAmountBox: {
    transition: 'background-color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    background: teal5,
    color: '#000000',
    fontSize: '16px',
    fontWeight: 600,
    padding: '8px',
    '&.selected': {
      backgroundColor: teal35
    },
    [theme.breakpoints.up('sm')]: {
      padding: '10px 16px',
      height: '150px',
      fontSize: '40px'
    }
  },
  tileTitleBar: {
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    color: '#000000',
    fontWeight: 600,
    fontFamily: 'Lato',
    padding: '8px',
    width: '45%',
    [theme.breakpoints.up('sm')]: {
      width: 'auto',
      padding: '10px 16px'
    }
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
}));

export default injectIntl(GuestRegistrationCard);
