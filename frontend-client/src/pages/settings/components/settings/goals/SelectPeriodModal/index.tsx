import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';

interface OwnProps {
  onAccept: (event: React.MouseEvent) => void;
  onDecline: (event: React.MouseEvent) => void;
  title?: string;
  open?: boolean;
}

type SelectPeriodModalProps = InjectedIntlProps & OwnProps;

const SelectPeriodModal: React.FunctionComponent<SelectPeriodModalProps> = (props) => {
  const [disabled, setDisabled] = React.useState<boolean>(false);
  const { intl, title, onDecline, onAccept, open } = props;

  const handleDecline = (event: React.MouseEvent) => {
    setDisabled(true);
    try {
      onDecline(event);
      setDisabled(false);
    } catch (e) {
      setDisabled(false);
    }
  };

  const handleAccept = (event: React.MouseEvent) => {
    setDisabled(true);
    try {
      onAccept(event);
      setDisabled(false);
    } catch (e) {
      setDisabled(false);
    }
  };

  return (
    <Dialog className={'dialog yesOrNoDialog'} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {intl.messages['dashboard.widget.settings.applySettingsForPreviousPeriods.msg']}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          className='dialogActionBtn secondary'
          disabled={disabled}
          type='button'
          onClick={handleAccept}
          variant='contained'
        >
          {intl.messages['yes']}
        </Button>
        <Button
          className='dialogActionBtn primary'
          disabled={disabled}
          type='button'
          onClick={handleDecline}
          variant='contained'
          color='primary'
        >
          {intl.messages['no']}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default injectIntl(SelectPeriodModal);
