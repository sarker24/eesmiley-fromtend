import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';

interface ComponentProps {
  message: string;
}

const OverlayBox: React.FunctionComponent<ComponentProps> = (props) => {
  const classes = useStyles(props);
  const { message } = props;

  return (
    <div className={classes.container}>
      <Typography variant={'h2'} component={'h2'} className={classes.message} align={'center'}>
        {message}
      </Typography>
    </div>
  );
};

const useStyles = makeStyles<Theme, ComponentProps>((theme) => ({
  container: {
    position: 'absolute',
    width: '90%',
    height: '50%',
    padding: theme.spacing(2),
    background: 'rgba(255,255,255, .91)',
    border: '1px solid #e5e5e5',
    borderRadius: '5px',
    top: '50%',
    transform: 'translate(-50%, -50%) rotate(-6deg)',
    left: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  message: {
    fontSize: theme.typography.pxToRem(45),
    fontWeight: 900,
    lineHeight: 1.2,
    margin: '30px 0'
  }
}));

export default OverlayBox;
