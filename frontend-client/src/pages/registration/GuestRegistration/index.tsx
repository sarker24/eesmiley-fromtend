import * as React from 'react';
import { useEffect, useReducer } from 'react';
import GuestRegistrationPage from 'registration/GuestRegistration/GuestRegistration';
import { API_DATE_FORMAT } from 'utils/datetime';
import { connect } from 'react-redux';
import { getAll as getAllGuestTypes, GuestTypeActions } from 'redux/ducks/guestTypes';
import * as guestRegistrationActions from 'redux/ducks/guestRegistrations';
import { CreateGuestRegistration } from 'redux/ducks/guestRegistrations/types';
import getGuestTypeRegistrations from './utils/getGuestTypeRegistrations';
import getSelectedGuestType from 'registration/GuestRegistration/utils/getSelectedGuestType';
import emptyGuestType from 'registration/GuestRegistration/utils/emptyGuestType';
import transformGuestRegistrationDraft from 'registration/GuestRegistration/utils/transformGuestRegistrationDraft';
import moment from 'moment';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { getEditorRegistrations } from 'redux/ducks/guestRegistrations/selectors';
import { getHasGuestTypesEnabled, getSettings } from 'redux/ducks/settings/selectors';
import CloseIcon from '@material-ui/icons/Close';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
  Button,
  Theme,
  IconButton
} from '@material-ui/core';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { GuestRegistrationActions } from 'redux/ducks/guestRegistrations';
import { Actions, GuestRegistrationState } from 'registration/GuestRegistration/types';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type GuestRegistrationContainerProps = StateProps & DispatchProps & InjectedIntlProps;

const initialState = (): GuestRegistrationState => ({
  guestTypeId: null,
  amount: null,
  date: moment().format(API_DATE_FORMAT),
  autoSelectSingleEntry: true,
  confirmChange: {
    showDialog: false
  }
});

const reducer = (state: GuestRegistrationState, action: Actions) => {
  switch (action.type) {
    case 'confirmChange':
      return { ...state, confirmChange: action.payload };
    case 'changeRegistration':
      return { ...state, ...action.payload };
    case 'changeGuestType':
      return { ...state, guestTypeId: action.payload };
    case 'deselect':
      return { ...initialState(), date: state.date, autoSelectSingleEntry: false };
  }
};

const GuestRegistrationContainer: React.FunctionComponent<GuestRegistrationContainerProps> = (
  props
) => {
  const classes = styles(props);
  const {
    createGuestRegistration,
    guestTypes,
    guestRegistrations,
    getGuestTypes,
    getGuestRegistrations,
    hasGuestTypesEnabled,
    intl
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState());

  useEffect(() => {
    if (hasGuestTypesEnabled) {
      void getGuestTypes();
    }
  }, []);

  useEffect(() => {
    void getGuestRegistrations(state.date);
  }, [state.date]);

  function handleSelectGuestType(id: number) {
    dispatch({
      type: 'changeGuestType',
      payload: id
    });
  }

  function handleDeselectGuestType() {
    dispatch({
      type: 'deselect'
    });
  }

  function handleChangeRegistration(draft: Partial<CreateGuestRegistration>) {
    dispatch({
      type: 'changeRegistration',
      payload: draft
    });
  }

  function handleAddRegistration(draft: CreateGuestRegistration) {
    const registrationData = transformGuestRegistrationDraft(draft);

    const oldRegistration = guestRegistrations.find(
      (registration) =>
        (!hasGuestTypesEnabled || registrationData.guestTypeId === registration.guestType.id) &&
        registration.amount
    );

    if (oldRegistration && !state.confirmChange.showDialog) {
      dispatch({
        type: 'confirmChange',
        payload: { showDialog: true, fromAmount: oldRegistration.amount }
      });
    } else {
      createRegistration(registrationData);
    }
  }

  function handleConfirm(amount: number) {
    handleAddRegistration({ guestTypeId: state.guestTypeId, date: state.date, amount });
  }

  function closeDialog() {
    dispatch({
      type: 'confirmChange',
      payload: { showDialog: false }
    });
  }

  function createRegistration(registration: CreateGuestRegistration) {
    dispatch({
      type: 'deselect'
    });
    void createGuestRegistration(registration);
  }

  const selectedGuestType = getSelectedGuestType({
    guestTypes,
    selectedGuestTypeId: state.guestTypeId,
    autoSelectSingleEntry: state.autoSelectSingleEntry
  });

  const guestTypesWithRegistrations = getGuestTypeRegistrations(guestTypes, guestRegistrations);

  const draft = {
    guestTypeId: selectedGuestType ? selectedGuestType.id : null,
    date: state.date,
    amount: state.amount
  };

  return (
    <>
      {state.confirmChange.showDialog && (
        <Dialog open={state.confirmChange.showDialog} fullWidth={true} onClose={closeDialog}>
          <DialogTitle disableTypography className={classes.dialogTitle}>
            <h3>{intl.messages['base.confirmChange']}</h3>
            <IconButton onClick={closeDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className={classes.buttonGroup}>
              <Button
                onClick={() => handleConfirm(state.amount)}
                classes={{ root: classes.button }}
                size='large'
              >
                {state.amount}
              </Button>
              <Button
                onClick={() => handleConfirm(state.confirmChange.fromAmount + state.amount)}
                classes={{ root: classes.button }}
                size='large'
              >
                {`${state.confirmChange.fromAmount} + ${state.amount}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <GuestRegistrationPage
        onAddGuestRegistration={handleAddRegistration}
        onChangeGuestRegistration={handleChangeRegistration}
        onSelectGuestType={handleSelectGuestType}
        onDeselectGuestType={handleDeselectGuestType}
        guestRegistrations={guestTypesWithRegistrations}
        selectedGuestType={selectedGuestType}
        guestRegistrationDraft={draft}
        disableClickAway={state.confirmChange.showDialog}
      />
    </>
  );
};

const styles = makeStyles<Theme, GuestRegistrationContainerProps>((theme) => ({
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  buttonGroup: {
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      flexFlow: 'row nowrap',
      justifyContent: 'space-between',
      '& > *': {
        maxWidth: '47%'
      }
    },
    [theme.breakpoints.down('xs')]: {
      flexFlow: 'column nowrap',
      '& > * + *': {
        marginTop: 10
      }
    }
  },
  button: {
    background: 'rgb(0, 150, 136)',
    color: '#ffffff',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    '&:hover': {
      background: 'rgba(0, 150, 136, 0.4)'
    }
  }
}));

const mapStateToProps = (state: RootState) => ({
  hasGuestTypesEnabled: getHasGuestTypesEnabled(state),
  guestTypes: getHasGuestTypesEnabled(state) ? state.guestTypes.guestTypes : [emptyGuestType],
  guestRegistrations: getEditorRegistrations(state),
  soundSettings: getSettings(state).sound
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, GuestRegistrationActions | GuestTypeActions>
) => ({
  getGuestTypes: () => dispatch(getAllGuestTypes({ active: true })),
  getGuestRegistrations: (date: string) =>
    dispatch(guestRegistrationActions.getEditorRegistrations({ date })),
  createGuestRegistration: async (guestRegistration) =>
    dispatch(guestRegistrationActions.createWithFlow(guestRegistration))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(GuestRegistrationContainer));
