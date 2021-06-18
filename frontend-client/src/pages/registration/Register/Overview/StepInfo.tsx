import { Typography, Paper, Button, Theme } from '@material-ui/core';
import * as React from 'react';
import SVGInline from 'react-svg-inline';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

import downArrowImage from 'static/icons/arrow-down-heavy.svg';
import swapImage from 'static/icons/swap_horiz.svg';

interface StepInfoProps {
  image: string;
  completed?: boolean;
  description?: string;
  title: string;
  className?: string;
  icon?: any;
  onClick: () => void;
  numOfSteps: number;
  step: number;
}

const StepInfo: React.FunctionComponent<StepInfoProps> = React.forwardRef<
  HTMLButtonElement,
  StepInfoProps
>((props, ref) => {
  const { image, className, onClick, description, title, step, numOfSteps } = props;

  const classes = useStyles(props);

  return (
    <Button
      ref={ref}
      fullWidth
      className={classNames(classes.stepButton, className, {
        [classes.stepButtonLast]: step === numOfSteps
      })}
      onClick={onClick}
    >
      <Paper
        className={classNames(classes.stepImage, { [classes.lastImage]: step === numOfSteps })}
        style={{
          background: `url(${image})`
        }}
        elevation={0}
        square
      >
        {numOfSteps >= 1 && numOfSteps !== step && (
          <SVGInline
            svg={downArrowImage}
            className={classNames(classes.downArrowIcon, classes.tealFill)}
          />
        )}
      </Paper>
      <div className={classes.caption}>
        <div className={classes.captionText}>
          <Typography variant='caption' gutterBottom className={classes.captionSubtitle}>
            {description}
          </Typography>
          <Typography variant='h4' className={classes.captionTitle} noWrap>
            {title}
          </Typography>
        </div>
        <SVGInline svg={swapImage} className={classNames(classes.captionIcon, classes.tealFill)} />
      </div>
    </Button>
  );
});

const useStyles = makeStyles((theme: Theme) => ({
  stepButton: {
    '&:hover': {
      '& polygon#arrow-right': {
        animation: `fly-out 300ms ${theme.transitions.easing.easeInOut}`
      },
      '& polygon#arrow-left': {
        animation: `fly-out reverse 300ms ${theme.transitions.easing.easeInOut}`
      }
    },
    '&:not(:first-of-type)': {
      marginTop: '32px',
      [theme.breakpoints.down('xs')]: {
        marginTop: '26px'
      }
    }
  },
  stepButtonLast: {
    backgroundColor: 'rgba(0, 150, 136, 0.06)'
  },
  stepImage: {
    position: 'relative',
    backgroundSize: 'cover!important',
    [theme.breakpoints.up('md')]: {
      minWidth: '80px',
      minHeight: '80px'
    },
    [theme.breakpoints.down('md')]: {
      minWidth: '60px',
      minHeight: '60px'
    }
  },
  lastImage: {
    [theme.breakpoints.up('md')]: {
      minWidth: '120px',
      minHeight: '120px'
    },
    [theme.breakpoints.down('md')]: {
      minWidth: '80px',
      minHeight: '80px'
    }
  },
  caption: {
    flex: '1 1 auto',
    marginLeft: '20px',
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    '& svg': {
      width: '20px',
      [theme.breakpoints.up('lg')]: {
        width: '28px',
        height: '20px'
      },
      // Needed to fix Safari bug that causes the animation to freeze sometimes on hover out
      '& polygon': {
        transform: 'translate3d(0, 0, 0)'
      }
    }
  },
  captionText: {
    display: 'flex',
    flexFlow: 'column nowrap',
    minWidth: 0
  },
  captionSubtitle: {
    textAlign: 'left',
    textTransform: 'none'
  },
  captionTitle: {
    wordBreak: 'break-word',
    textAlign: 'left',
    fontSize: '20px',
    lineHeight: '25px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  captionIcon: {},
  downArrowIcon: {
    width: '18px',
    height: '25px',
    left: '50%',
    transform: 'translateX(-50%)',
    position: 'absolute',
    fill: 'rgb(0, 150, 136)',
    top: '100%',
    marginTop: '10px',
    [theme.breakpoints.down('xs')]: {
      width: '13px',
      height: '20px'
    }
  },
  '@keyframes fly-out': {
    '0%': {
      transform: 'translate3d(0, 0, 0)'
    },
    '50%': {
      transform: 'translate3d(-100%, 0, 0)'
    },
    '51%': {
      transform: 'translate3d(100%, 0, 0)'
    },
    '100%': {
      transform: 'translate3d(0, 0, 0)'
    }
  },
  tealFill: {
    fill: '#009688'
  }
}));

StepInfo.displayName = 'StepInfo';

export default StepInfo;
