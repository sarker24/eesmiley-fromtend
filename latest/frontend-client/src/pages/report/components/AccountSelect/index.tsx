import * as React from 'react';
import { connect } from 'react-redux';
import * as settingsDispatch from 'redux/ducks/settings';
import { SavedFilterSelection, SettingsActions } from 'redux/ducks/settings';
import { getSavedFilterSelections } from 'redux/ducks/settings/selectors';
import AccountSelect, { AccountSelectProps } from 'report/components/AccountSelect/AccountSelect';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

const mapStateToProps = (state: RootState) => ({
  savedSelections: getSavedFilterSelections(state)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, SettingsActions>) => ({
  changeSavedSelections: (selection: SavedFilterSelection[]) =>
    dispatch(settingsDispatch.changeSavedSelections(selection))
});

type AccountSelectContainerProps = Omit<
  AccountSelectProps,
  'savedSelections' | 'onSavedSelectionChange'
>;

const AccountSelectContainer: React.FunctionComponent<
  AccountSelectContainerProps & StateProps & DispatchProps
> = (props) => {
  const { changeSavedSelections, savedSelections, ...rest } = props;
  return (
    <AccountSelect
      savedSelections={savedSelections}
      onSavedSelectionChange={changeSavedSelections}
      {...rest}
    />
  );
};

export default connect<StateProps, DispatchProps, AccountSelectContainerProps>(
  mapStateToProps,
  mapDispatchToProps
)(AccountSelectContainer);
