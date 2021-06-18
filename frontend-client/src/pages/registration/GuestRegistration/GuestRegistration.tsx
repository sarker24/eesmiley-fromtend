import Container from 'container';
import * as React from 'react';
import { GuestTypeRegistration } from 'registration/GuestRegistration/types';
import GuestRegistrationForm from 'registration/GuestRegistration/components/GuestRegistrationForm';
import { GuestType } from 'redux/ducks/guestTypes/types';
import { CreateGuestRegistration } from 'redux/ducks/guestRegistrations/types';
import GuestRegistrationCard from 'registration/GuestRegistration/components/GuestRegistrationCard';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import {
  useMediaQuery,
  GridList,
  Box,
  ClickAwayListener,
  Grid,
  makeStyles,
  Portal,
  Theme,
  Typography
} from '@material-ui/core';
import classNames from 'classnames';
import { useTheme } from '@material-ui/core/styles';
import { black89H, teal, teal35 } from 'registration/GuestRegistration/styles';

interface GuestRegistrationProps extends InjectedIntlProps {
  guestRegistrations: GuestTypeRegistration[];
  guestRegistrationDraft: Partial<CreateGuestRegistration>;
  selectedGuestType: GuestType;
  disableClickAway: boolean;

  onChangeGuestRegistration: (data: Partial<CreateGuestRegistration>) => void;
  onAddGuestRegistration: (guestRegistration: CreateGuestRegistration) => void;
  onSelectGuestType: (guestTypeId: number) => void;
  onDeselectGuestType: () => void;
}

// TODO: refactor out layout properly so we wont need to pass too many params
const GuestRegistration: React.FunctionComponent<GuestRegistrationProps> = (props) => {
  const theme = useTheme();
  const classes = styles(props);
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const isLimitedHeight = useMediaQuery('(max-height: 500px)');
  const isLimitedHeightAndNoMobile = !isMobile && isLimitedHeight;
  const isLimitedHeightOrMobile = isMobile || isLimitedHeight;

  const {
    onChangeGuestRegistration,
    onAddGuestRegistration,
    onDeselectGuestType,
    onSelectGuestType,
    guestRegistrations,
    guestRegistrationDraft,
    selectedGuestType,
    disableClickAway,
    intl
  } = props;

  function handleAddRegistration(registration: CreateGuestRegistration) {
    onAddGuestRegistration(registration);
  }

  function handleRegistrationChange(registration: Partial<CreateGuestRegistration>) {
    onChangeGuestRegistration(registration);
  }

  function handleAwayClick(event: React.MouseEvent<Document>) {
    // only used to show/hide keypad when only (disabled or one) guest type and there's not enough space on screen
    if (
      disableClickAway === true ||
      (guestRegistrations.length === 1 && !isLimitedHeightOrMobile)
    ) {
      return;
    }

    if (event.target instanceof HTMLElement) {
      const target = event.target;
      if (target.dataset && target.dataset.disableClickAway) {
        return;
      }
    }

    onDeselectGuestType();
  }

  const noRightMargin = !(isMobile || (isLimitedHeightAndNoMobile && !selectedGuestType));

  return (
    <Container
      className={classNames('guestRegistration-container', { 'no-right-margin': noRightMargin })}
    >
      <Grid container className={classes.container}>
        <Grid
          item
          xs={12}
          sm={isLimitedHeightAndNoMobile && !selectedGuestType ? 12 : 6}
          md={7}
          lg={8}
          className={classes.listContainer}
        >
          <Typography className={classes.title} component='h4'>
            {
              // eslint-disable-next-line
              (intl.messages['guestRegistration'] as any).other
            }
          </Typography>
          <GridList
            spacing={16}
            cellHeight='auto'
            cols={isMobile || (isSm && !isLimitedHeightAndNoMobile) ? 1 : 2}
            className={classes.list}
          >
            {guestRegistrations.map((guestRegistration) => {
              const isSelected =
                !!selectedGuestType && guestRegistration.guestType.id === selectedGuestType.id;
              return (
                <GuestRegistrationCard
                  data-disable-click-away={true}
                  key={guestRegistration.guestType.id}
                  guestTypeRegistration={guestRegistration}
                  onSelectGuestType={onSelectGuestType}
                  isSelected={isSelected}
                />
              );
            })}
          </GridList>
        </Grid>
        <Grid item xs={12} sm={isLimitedHeightAndNoMobile ? 12 : 6} md={5} lg={4}>
          {(!isLimitedHeightOrMobile || !!selectedGuestType) && (
            <Portal disablePortal={!isLimitedHeightOrMobile}>
              <Box height={'100%'}>
                <ClickAwayListener onClickAway={handleAwayClick}>
                  <GuestRegistrationForm
                    className={classNames({
                      [classes.mobileForm]: isMobile,
                      [classes.floatRightForm]: isLimitedHeightAndNoMobile
                    })}
                    onChange={handleRegistrationChange}
                    onSubmit={handleAddRegistration}
                    guestRegistration={guestRegistrationDraft}
                    options={{
                      keypad: {
                        enabled: !!selectedGuestType,
                        label: selectedGuestType
                          ? selectedGuestType.name || intl.messages['guestAmount']
                          : intl.messages['selectGuestType']
                      }
                    }}
                  />
                </ClickAwayListener>
              </Box>
            </Portal>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

const styles = makeStyles<Theme, GuestRegistrationProps>((theme) => ({
  title: {
    textTransform: 'uppercase',
    color: black89H,
    textAlign: 'center',
    fontWeight: 800,
    marginBottom: '20px',
    fontSize: '25px',
    [theme.breakpoints.down('md')]: {
      fontSize: '14px'
    }
  },
  container: {
    maxWidth: '1024px!important',
    width: '100%',
    margin: 'auto',
    height: '100%',
    '& > *': {
      height: '100%'
    }
  },
  listContainer: {
    overflow: 'hidden',
    padding: '16px'
  },
  list: {
    maxHeight: '100%',
    paddingBottom: '20px',
    border: 0 /* IE11 fix */
  },
  keypadContainer: {
    padding: 0
  },
  mobileForm: {
    transition: 'all 0.3s ease-in-out',
    zIndex: 600,
    [theme.breakpoints.down('xs')]: {
      position: 'fixed',
      bottom: 0,
      width: '100%',
      height: 'auto'
    }
  },
  floatRightForm: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    right: 0,
    height: 'auto',
    overflow: 'auto',
    zIndex: 9000 /* has to be on top of topnav */
  },
  fab: {
    background: '#ffffff',
    color: teal,
    border: `1px solid ${teal}`,
    position: 'fixed',
    bottom: '20px',
    marginLeft: '10px',
    zIndex: 501 /* on top of legend headers */,
    '&:hover': {
      background: teal35
    }
  }
}));

export default injectIntl(GuestRegistration);
