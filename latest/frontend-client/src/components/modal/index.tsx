import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Theme,
  Typography
} from '@material-ui/core';
import classNames from 'classnames';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/styles';
import { Modal as TModal } from 'redux/ducks/ui';

export interface ModalProps {
  modal?: TModal; // actual modal content
  hideModal?: () => void;
  className?: string;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    dialogTitle: {
      margin: 0
    },
    closeIcon: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1)
    },
    zeroPadding: {
      padding: 0,
      '&:first-child': {
        paddingTop: 0
      }
    }
  }),
  { name: 'Modal' }
);

export const Modal: React.FunctionComponent<ModalProps> = (props) => {
  const classes = useStyles(props);
  const { modal, hideModal, className, children } = props;
  const modalRef = React.useRef<React.ReactNode>(null);

  const handleClose = () => {
    if (
      hideModal &&
      !(
        document.activeElement &&
        document.activeElement.getAttribute &&
        document.activeElement.getAttribute('role') == 'menuitem'
      )
    ) {
      hideModal();
    }
  };

  const modalClassName = modal ? modal.className : undefined;
  const modalClass = classNames(
    'modal',
    {
      'is-visible': modal && modal.visible
    },
    className,
    modalClassName
  );

  const modalContentWithProps =
    modal && modal.content
      ? React.Children.map(modal.content, (child: React.ReactElement) =>
          React.cloneElement(
            child,
            modalRef && modalRef.current ? { modalRef: modalRef.current } : {}
          )
        )
      : null;

  return (
    <div className='modalWrapper'>
      {children}
      {modal && modal.content ? (
        <Dialog
          maxWidth={modal.size || 'lg'}
          open={modal.visible}
          fullWidth={modal.fullWidth}
          className={modalClass}
          classes={{ container: 'modal-container' }}
          onClose={handleClose}
          scroll={'paper'}
          ref={modalRef}
        >
          {!modal.fullBleed && (
            <DialogTitle disableTypography className={classes.dialogTitle}>
              <Typography variant='h5'>{modal.title ? modal.title : null}</Typography>
              <IconButton className={classes.closeIcon} onClick={hideModal}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
          )}
          <DialogContent className={classNames({ [classes.zeroPadding]: modal.disablePadding })}>
            {modalContentWithProps}
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
};

export default Modal;
