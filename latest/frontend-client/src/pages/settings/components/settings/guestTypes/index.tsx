import * as React from 'react';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import GuestTypes from 'settings/components/settings/guestTypes/GuestTypes';
import {
  CreateGuestType,
  GuestType,
  GuestTypeActions,
  GuestTypeQuery
} from 'redux/ducks/guestTypes/types';
import * as guestTypeActions from 'redux/ducks/guestTypes';
import { setGuestSettings, SettingsActions } from 'redux/ducks/settings';
import GuestTypeDialog from 'settings/components/settings/guestTypes/components/guestTypeDialog';
import { getHasGuestTypesEnabled } from 'redux/ducks/settings/selectors';
import { GuestSettings, GuestTypeSettings } from 'redux/ducks/settings/types';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type ComponentProps = DispatchProps & StoreProps;

interface GuestTypesContainerState {
  showGuestTypeDialog: boolean;
  isLoading: boolean;
  pendingChange?: NestedPartial<GuestSettings>;
}

const InitialState: GuestTypesContainerState = {
  showGuestTypeDialog: false,
  isLoading: false,
  pendingChange: { guestTypes: {} }
};

const GuestTypesContainer: React.FunctionComponent<ComponentProps> = (props) => {
  const {
    guestTypes,
    hasGuestTypesEnabled,
    getAll,
    deleteById,
    update,
    create,
    hasGuestRegistrationFlowEnabled,
    setGuestSettings
  } = props;

  const [state, setState] = useState<GuestTypesContainerState>(InitialState);

  useEffect(() => {
    void getAll();
  }, []);

  useEffect(() => {
    if (state.showGuestTypeDialog || state.isLoading) {
      setState(InitialState);
    }
  }, [hasGuestTypesEnabled]);

  function handleToggleGuestFlow(hasFlowEnabled: boolean) {
    if (!hasFlowEnabled && hasGuestTypesEnabled) {
      setState({
        ...state,
        showGuestTypeDialog: true,
        pendingChange: { enableGuestRegistrationFlow: false, guestTypes: { enabled: false } }
      });
    } else {
      void setGuestSettings({ enableGuestRegistrationFlow: hasFlowEnabled });
    }
  }

  function handleGuestTypesChange(hasGuestTypesEnabled: boolean) {
    setState({
      ...state,
      showGuestTypeDialog: true,
      pendingChange: { guestTypes: { enabled: hasGuestTypesEnabled } }
    });
  }

  function handleDelete(guestType: GuestType) {
    void deleteById(guestType.id);
  }

  function handleCreate(guestType: CreateGuestType) {
    void create(guestType);
  }

  function handleUpdate(guestType: GuestType) {
    void update(guestType);
  }

  function handleGuestTypeSettingsChange(guestTypes: GuestTypeSettings) {
    setState({ ...state, isLoading: true });
    void setGuestSettings({ ...state.pendingChange, guestTypes } as GuestSettings);
  }

  return (
    <>
      {state.showGuestTypeDialog && (
        <GuestTypeDialog
          isOpen={state.showGuestTypeDialog}
          isLoading={state.isLoading}
          pendingGuestTypes={state.pendingChange.guestTypes}
          onClose={() => setState({ ...state, showGuestTypeDialog: false })}
          guestTypes={guestTypes}
          onGuestTypeSettingsChange={handleGuestTypeSettingsChange}
        />
      )}
      <GuestTypes
        onToggleGuestRegistrationFlow={handleToggleGuestFlow}
        guestTypes={guestTypes}
        hasGuestTypesEnabled={hasGuestTypesEnabled}
        hasGuestRegistrationFlowEnabled={hasGuestRegistrationFlowEnabled}
        onToggleGuestTypes={handleGuestTypesChange}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  hasGuestTypesEnabled: getHasGuestTypesEnabled(state),
  hasGuestRegistrationFlowEnabled: state.settings.enableGuestRegistrationFlow,
  guestTypes: state.guestTypes.guestTypes
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, GuestTypeActions | SettingsActions>
) => ({
  getAll: (query?: GuestTypeQuery) => dispatch(guestTypeActions.getAll(query)),
  deleteById: (id: number) => dispatch(guestTypeActions.deleteById(id)),
  create: (guestType: CreateGuestType) => dispatch(guestTypeActions.create(guestType)),
  update: (guestType: GuestType) => dispatch(guestTypeActions.update(guestType)),
  setGuestSettings: (settings: GuestSettings) => dispatch(setGuestSettings(settings))
});

export default connect(mapStateToProps, mapDispatchToProps)(GuestTypesContainer);
