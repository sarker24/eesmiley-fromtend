import * as React from 'react';
import { useState, useEffect } from 'react';
import Slide from '@material-ui/core/Slide';
import SnackbarNotification from './SnackbarNotification';

function SlideTransition(props) {
  return <Slide {...props} direction='up' />;
}

interface ComponentProps {
  delayDuration?: number;
  link?: string;
  headlineText?: string;
  buttonText?: string;
  Image?: JSX.Element;
}

// This can be extended to allow setting the anchor element, transition type,
// and any other props that the Snackbar component supports
// https://material-ui.com/components/snackbars/
const SnackbarNotificationContainer: React.FunctionComponent<ComponentProps> = ({
  delayDuration,
  ...otherProps
}) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const openTimeout = setTimeout(
      () => {
        setOpen(true);
      },
      delayDuration ? delayDuration : 0
    );

    return () => {
      if (openTimeout) {
        clearTimeout(openTimeout);
      }
    };
  }, []);

  const closeHandler = () => {
    setOpen(false);
  };

  return (
    <SnackbarNotification
      onCloseClick={closeHandler}
      isOpen={isOpen}
      transition={SlideTransition}
      {...otherProps}
    />
  );
};

export default SnackbarNotificationContainer;
