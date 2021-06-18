import './index.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { Snackbar, SnackbarContent, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import * as notificationDispatch from 'redux/ducks/notification';
import * as errorDispatch from 'redux/ducks/error';
import classNames from 'classnames';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { NotificationActions } from 'redux/ducks/notification';
import { ErrorActions } from 'redux/ducks/error';

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type NotificationProps = StoreProps & DispatchProps;

class Notification extends React.Component<NotificationProps> {
  /**
   * Triggers a close on the error banner or notification component
   * @param { React.MouseEvent<HTMLElement> } event: Mouse Event
   * @public
   */
  onCloseHandler = (event: React.MouseEvent): void => {
    event && event.stopPropagation();
    const { error, closeError, closeNotification } = this.props;

    error.active ? closeError() : closeNotification();
  };

  render() {
    const { error, notification, closeNotification } = this.props;
    const isNotificationActive = error.active || notification.active;
    const isMessage = !error.active && notification.active;
    const notificationMessage = error.active
      ? `${error.code} - ${error.message}`
      : notification.active
      ? notification.message
      : null;

    const notificationClassName = classNames(
      'notification',
      {
        'is-message': isMessage
      },
      {
        error: (notification.isError && 'isError') || error.active
      }
    );

    const style = {
      minWidth: '102.2%',
      maxWidth: '102.2%',
      minHeight: '48px',
      padding: '12px 24px 8px 36px',
      fontSize: '18px'
    };

    const bodyStyle = isMessage ? style : null;
    const notificationTimeout = 5000;
    const vertical = 'top';
    const dismissActionElement = (
      <IconButton className='closeIcon' onClick={this.onCloseHandler}>
        <CloseIcon
          style={{
            width: '35px',
            height: '35px',
            fontWeight: 900
          }}
        />
      </IconButton>
    );
    const errorIcon = notification.icon || <ErrorIcon className='red-fill' />;
    const messageElement = notificationMessage ? (
      <div>
        {notification.isError ? errorIcon : notification.icon}
        <span>{notificationMessage}</span>
      </div>
    ) : (
      <span />
    );

    return (
      <Snackbar
        onClick={closeNotification}
        anchorOrigin={{ vertical, horizontal: 'center' }}
        className={notificationClassName}
        open={isNotificationActive}
        autoHideDuration={notificationTimeout}
        onClose={this.onCloseHandler}
      >
        <SnackbarContent message={messageElement} action={dismissActionElement} style={bodyStyle} />
      </Snackbar>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  notification: state.notification,
  error: state.error
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<unknown, unknown, NotificationActions | ErrorActions>
) => ({
  closeNotification: () => dispatch(notificationDispatch.closeNotification()),
  closeError: () => dispatch(errorDispatch.closeError())
});

const ConnectedNav = connect<StoreProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(Notification);

export default ConnectedNav;
