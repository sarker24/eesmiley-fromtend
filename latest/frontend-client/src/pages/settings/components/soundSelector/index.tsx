import * as React from 'react';
import { Select, MenuItem } from '@material-ui/core';
import playSound from 'utils/playSound';
import { connect } from 'react-redux';
import { InjectedIntl, InjectedIntlProps, injectIntl } from 'react-intl';
import * as settingsDispatch from 'redux/ducks/settings';
import * as mediaDispatch from 'redux/ducks/media';
import { RootState } from 'redux/rootReducer';
import { getSettings, SavedSettings, SettingsActions } from 'redux/ducks/settings';
import { ThunkDispatch } from 'redux-thunk';
import { Media, MediaActions } from 'redux/ducks/media';

import waveGif from 'static/sound_wave.gif';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface OwnProps {
  updateSettings: (settings: Partial<SavedSettings>) => void;
}

export interface SoundSelectorState {
  chosenObject: null | Media;
  playbackStatus: boolean;
}

type SoundSelectorProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class SoundSelector extends React.Component<SoundSelectorProps, SoundSelectorState> {
  constructor(props) {
    super(props);
    this.state = {
      chosenObject: null,
      playbackStatus: false
    };
  }

  handleSound = (id) => {
    const { sounds, updateSettings } = this.props;
    const value = sounds.find((s) => s.id === id);
    const newState = {
      chosenObject: value,
      playbackStatus:
        value == null
          ? false
          : !this.state.playbackStatus
          ? !this.state.playbackStatus
          : this.state.playbackStatus
    };

    this.setState(newState);
    const newValue = value
      ? { sound: { ...value, enabled: true } }
      : { sounds: { enabled: false } };
    if (value) {
      playSound(value.url, () => {
        this.setState({ playbackStatus: !this.state.playbackStatus });
      });
    }

    updateSettings(newValue);
  };

  componentDidMount() {
    void this.props.getSettings().then(() => {
      void this.props.fetchNotificationSounds(this.props.intl).then(() => {
        let sound: Media = null;
        if (this.props.soundSettings.name) {
          const sounds = this.props.sounds.filter((sound) => {
            if (sound.id === this.props.soundSettings.id) {
              return sound;
            }
          });
          if (sounds.length > 0) {
            sound = sounds[0];
          }
        } else {
          sound = null;
        }

        this.setState({ chosenObject: sound });
      });
    });
  }

  render() {
    const { intl, sounds } = this.props;
    const { chosenObject, playbackStatus } = this.state;

    return (
      <div className='soundSelector'>
        <Select
          onChange={(event) => this.handleSound(event.target.value)}
          value={chosenObject ? chosenObject.id : ''}
        >
          <MenuItem key='0' value={''}>
            {intl.messages['settings.noSound']}
          </MenuItem>
          {sounds.map((sound, index) => (
            <MenuItem key={index + 1} value={sound.id}>
              {sound.name}
            </MenuItem>
          ))}
        </Select>
        <img className={`${playbackStatus ? 'soundWave' : 'hiddenSoundwave'}`} src={waveGif} />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  soundSettings: getSettings(state).sound,
  sounds: state.media.soundList
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, SettingsActions | MediaActions>
) => ({
  getSettings: () => dispatch(settingsDispatch.fetch()),
  fetchNotificationSounds: (intl: InjectedIntl) =>
    dispatch(mediaDispatch.fetchNotificationSounds(intl))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SoundSelector));
