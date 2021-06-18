import * as React from 'react';
import { Button, MobileStepper } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import * as settingsDispatch from '../../../redux/ducks/settings';
import { makeStyles } from '@material-ui/core/styles';
import { RootState } from 'redux/rootReducer';
import {
  getSettings,
  SavedSettings,
  SettingsActions,
  SettingsState
} from '../../../redux/ducks/settings';
import { ThunkDispatch } from 'redux-thunk';
import LoadingPlaceHolder from 'LoadingPlaceholder';
import ConfirmSettingsStep from 'modalContent/after-sing-up-modal/ConfirmSettingsStep';
import BootstrapDataStep from 'modalContent/after-sing-up-modal/BootstrapDataStep';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface OwnProps {
  onClose: () => void;
  onStepChange: (step: 0 | 1) => void;
  step: 0 | 1;
}

export interface IComponentState {
  bootstrapData: boolean;
  currency: string;
}

type AfterSignUpModalProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

const useStyles = makeStyles((theme) => ({
  currencySelector: {
    display: 'flex',
    alignItems: 'center',
    '& label': {
      flex: '0 0 auto',
      marginRight: theme.spacing(2)
    }
  },
  buttonFooter: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
    '& button + button': {
      marginLeft: theme.spacing(1)
    }
  },
  stepper: {
    backgroundColor: 'transparent',
    justifyContent: 'center'
  }
}));

const Steps = [ConfirmSettingsStep, BootstrapDataStep];
const ButtonLabels = ['base.next', 'base.save'];

const AfterSignUpModal: React.FunctionComponent<AfterSignUpModalProps> = (props) => {
  const { intl, settings, onClose, updateSettings, ui, step, onStepChange } = props;
  const classes = useStyles(props);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [draftSettings, setDraftSettings] = React.useState<Partial<SettingsState>>({
    ...props.settings,
    languageBootstrapData: ui.locale
  });

  const submitSettings = async (settings: Partial<SavedSettings>) => {
    setLoading(true);
    await updateSettings(settings);
    setLoading(false);
    onClose();
  };

  const handleNext = () => {
    onStepChange(1);
  };

  const handleSave = async () => {
    await submitSettings({
      ...settings,
      ...draftSettings
    });
  };

  const handleSkipBootstrap = async () => {
    const { bootstrapTemplateId, ...rest } = draftSettings;
    await submitSettings({ ...settings, ...rest });
  };

  const handleDraftChange = (draft: Partial<SavedSettings>) => {
    setDraftSettings({ ...draftSettings, ...draft });
  };

  const CurrentStep = Steps[step];
  const buttonLabel = ButtonLabels[step];
  const handleClick = step === 0 ? handleNext : handleSave;
  const saveEnabled = step === 0 || draftSettings.bootstrapTemplateId;

  return loading ? (
    <LoadingPlaceHolder />
  ) : (
    <div className='innerAfterSignUpModal'>
      <CurrentStep settings={draftSettings} onChange={handleDraftChange} />
      <div className={classes.buttonFooter}>
        {step === 1 && (
          <Button variant='outlined' color='primary' onClick={handleSkipBootstrap}>
            {intl.messages['skip']}
          </Button>
        )}
        <Button
          variant='contained'
          color='primary'
          className='afterSignUpModalSubmitBtn'
          disabled={!saveEnabled}
          onClick={handleClick}
        >
          {intl.messages[buttonLabel]}
        </Button>
      </div>
      <MobileStepper
        className={classes.stepper}
        variant='dots'
        steps={2}
        position='static'
        activeStep={step}
        nextButton={null}
        backButton={null}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  settings: getSettings(state),
  ui: state.ui
});

const mapDispatchToProps = (dispatch: ThunkDispatch<unknown, unknown, SettingsActions>) => ({
  updateSettings: (data) => dispatch(settingsDispatch.update(data))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AfterSignUpModal));
