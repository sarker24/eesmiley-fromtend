import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Radio,
  Typography
} from '@material-ui/core';
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RootState } from 'redux/rootReducer';
import { update as updateSettings } from 'redux/ducks/settings';
import { connect } from 'react-redux';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export interface HasScaleConfirmationModalProps {
  open: boolean;
}

type OwnProps = StateProps & DispatchProps & InjectedIntlProps & HasScaleConfirmationModalProps;

const useStyles = makeStyles((theme) => ({
  content: {
    '& > * + *': {
      marginTop: theme.spacing(2)
    }
  },
  contentText: {
    ...theme.typography.body2
  },
  radio: {
    padding: `0 9px`
  }
}));

const ConnectionAttemptManager = () => {
  let attempts = 0;
  const showModalThreshold = 2;

  const getAttempts = (): number => {
    return attempts;
  };

  const increase = (): void => {
    attempts = attempts + 1;
  };

  return {
    getAttempts,
    increase,
    onThreshold: () => getAttempts() !== 0 && getAttempts() % showModalThreshold === 0
  };
};

const attemptManager = ConnectionAttemptManager();

const ScaleConfirmationModal: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const { updateSettings, isConnected, isConnecting, intl } = props;
  const [hasEsmileyScale, setHasEsmileyScale] = React.useState<boolean>();
  const [showModal, setShowModal] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!isConnecting && !isConnected) {
      attemptManager.increase();
      if (attemptManager.onThreshold()) {
        setShowModal(true);
      }
    }
  }, [isConnecting]);

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleSave = () => {
    updateSettings({ hasEsmileyScale, hasEsmileyScaleConfirmed: true });
  };

  return (
    <Dialog open={showModal} maxWidth='sm'>
      <DialogTitle>{intl.messages['scaleConfirmation.title']}</DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant='body2'>{intl.messages['scaleConfirmation.doYouHaveScale']}</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Radio
                size='small'
                color='primary'
                checked={hasEsmileyScale === true}
                onChange={() => setHasEsmileyScale(true)}
              />
            }
            label={intl.messages['scaleConfirmation.hasScale']}
            classes={{ label: classes.contentText }}
          />
          <FormControlLabel
            control={
              <Radio
                size='small'
                color='primary'
                checked={hasEsmileyScale === false}
                onChange={() => setHasEsmileyScale(false)}
              />
            }
            label={intl.messages['scaleConfirmation.doesntHaveScale']}
            classes={{ label: classes.contentText }}
          />
        </FormGroup>
        <Typography variant='body2'>
          {intl.messages['scaleConfirmation.changingSettings']}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>{intl.messages['base.cancel']}</Button>
        <Button
          color='primary'
          variant='contained'
          onClick={handleSave}
          disabled={hasEsmileyScale === undefined}
        >
          {intl.messages['base.save']}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state: RootState) => ({
  isConnected: state.registration.scaleStatus.isConnected,
  isConnecting: state.registration.scaleStatus.isConnecting
});

const mapDispatchToProps = {
  updateSettings
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ScaleConfirmationModal));
