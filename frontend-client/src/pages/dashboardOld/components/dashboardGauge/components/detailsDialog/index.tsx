import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import './index.scss';
import { createStyles, Dialog, DialogContent, DialogTitle, IconButton } from '@material-ui/core';

export interface OwnProps {
  children: React.ReactElement;
  title: string;
  open: boolean;
  onClose: () => void;
}

type DetailsDialogProps = InjectedIntlProps & OwnProps;

class DetailsDialog extends React.Component<DetailsDialogProps> {
  render() {
    const { children, title, onClose, open } = this.props;

    return (
      <Dialog className='detailsDialog' onClose={onClose} open={open} maxWidth='md' fullWidth>
        <DialogTitle>
          <div className='dialogTitle'>
            <p>{title}</p>
            <IconButton className='closeButton' onClick={onClose}>
              {<CloseIcon />}
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    );
  }
}

const styles = createStyles({
  detailsDialog: {
    height: '100%',
    width: '100%'
  }
});

export default withStyles(styles)(injectIntl(DetailsDialog));
