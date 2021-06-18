import * as React from 'react';
import { IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BluetoothIcon from '@material-ui/icons/Bluetooth';

const ScanButton: React.FunctionComponent<unknown> = (props) => {
  const classes = useStyles(props);

  const handleClick = () => {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ startScan: true }));
    }
  };

  return (
    <IconButton classes={{ root: classes.root }} onClick={handleClick}>
      <BluetoothIcon className={classes.icon} />
    </IconButton>
  );
};

const useStyles = makeStyles({
  root: {
    color: '#FFF',
    background: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 2,
    position: 'absolute',
    top: 4,
    padding: '8px 8px 8px 8px',
    right: 4,
    width: 65,
    height: 65,

    ['@media screen and (max-width: 1024px)']: {
      width: 56,
      height: 56
    },

    '&:hover': {
      background: 'rgba(0, 0, 0, 0.06)'
    }
  },
  icon: {
    fill: 'rgb(0, 150, 136)',
    width: 30,
    marginLeft: 0,
    marginRight: 0,
    height: 30
  }
});

export default ScanButton;
