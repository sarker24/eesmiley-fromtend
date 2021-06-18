import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';

interface SaveSelectionDialogProps {
  onSave: (name: string) => void;
  disabled: boolean;
}

const SaveSelectionDialog: React.FunctionComponent<SaveSelectionDialogProps & InjectedIntlProps> = (
  props
) => {
  const { intl, onSave, disabled } = props;
  const [open, setOpen] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    handleClose();
    onSave(name);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value }
    } = event;
    setName(value);
  };

  return (
    <>
      <Button
        fullWidth
        variant='outlined'
        color='primary'
        onClick={handleClickOpen}
        disabled={disabled}
      >
        {intl.messages['report.filter.saveSelectionAs']}
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>
          {' '}
          {intl.messages['report.filter.saveSelectionAs']}
        </DialogTitle>
        <DialogContent>
          <TextField
            color='primary'
            InputLabelProps={{ shrink: true }}
            autoFocus
            margin='dense'
            label={intl.messages['name']}
            onChange={handleNameChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant='text' onClick={handleClose} color='primary'>
            {intl.messages['base.cancel']}
          </Button>
          <Button
            disabled={name.length === 0}
            variant='contained'
            onClick={handleSave}
            color='primary'
          >
            {intl.messages['base.save']}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default injectIntl(SaveSelectionDialog);
