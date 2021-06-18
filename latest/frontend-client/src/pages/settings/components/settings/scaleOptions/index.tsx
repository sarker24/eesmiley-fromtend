import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { connect } from 'react-redux';
import HelpText from 'components/helpText';
import { Switch } from '@material-ui/core';
import { getSettings, SavedSettings, SettingsActions, update } from 'redux/ducks/settings';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { UiActions } from 'redux/ducks/ui';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type OwnProps = {
  /* no props */
};

type ScaleOptionsProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

const ScaleOptions: React.FunctionComponent<ScaleOptionsProps> = (props) => {
  const { intl, updateSettings, canUseBluetooth, hasEsmileyScale } = props;

  return (
    <div className='basicSettings'>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className='field'>
          <label htmlFor='esmiley-scale-toggle'>
            <span>{intl.messages['settings.hasEsmileyScale']}</span>
          </label>
          <div id='esmiley-scale-toggle' className='control'>
            <Switch
              color='primary'
              onChange={(e, isEnabled) => {
                void updateSettings({ hasEsmileyScale: isEnabled });
              }}
              checked={hasEsmileyScale}
            />
          </div>
          <HelpText helpText={intl.messages['help.settings.hasEsmileyScale']} />
        </div>
        <div className='field'>
          <label htmlFor='bluetooth-scale-toggle'>
            <span>{intl.messages['settings.canUseBluetooth']}</span>
          </label>
          <div id='bluetooth-scale-toggle' className='control'>
            <Switch
              color='primary'
              onChange={(e, isEnabled) => {
                void updateSettings({ canUseBluetooth: isEnabled });
              }}
              checked={canUseBluetooth}
            />
          </div>
          <HelpText helpText={intl.messages['help.settings.canUseBluetooth']} />
        </div>
      </form>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  canUseBluetooth: getSettings(state).canUseBluetooth,
  hasEsmileyScale: getSettings(state).hasEsmileyScale
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, UiActions | SettingsActions>
) => ({
  updateSettings: (data: Partial<SavedSettings>) => dispatch(update(data))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ScaleOptions));
