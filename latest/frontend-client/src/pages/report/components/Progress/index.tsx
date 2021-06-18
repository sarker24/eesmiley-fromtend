import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Icon } from 'icon';
import classNames from 'classnames';
import arrowDownImage from 'static/icons/arrow-down-solid.svg';
import withLoading, { WithLoadingProps } from 'LoadingPlaceholder/withLoading';

interface ComponentProps extends InjectedIntlProps, WithLoadingProps {
  text: string | React.ReactElement;
  value: number;
  invertedProgress?: boolean;
  className?: string;
}

const Progress: React.FunctionComponent<ComponentProps> = (props) => {
  const classes = useStyles(props);
  const { value, text, invertedProgress, intl, className } = props;
  const arrowClasses = classNames(
    classes.arrow,
    value < 0 && classes.arrowDown,
    value < 0
      ? invertedProgress
        ? classes.arrowPoz
        : classes.arrowNeg
      : invertedProgress
      ? classes.arrowNeg
      : classes.arrowPoz
  );

  return (
    <div className={classes.container + ' ' + className}>
      <Typography component={'h4'}>
        {value !== 0 && <Icon icon={arrowDownImage} className={arrowClasses} />}
        <Typography component={'span'} className={classes.value}>
          {intl.formatNumber(Math.abs(value), { maximumFractionDigits: 2 }) + ' %'}
        </Typography>
        <br />
        <Typography component={'span'} className={classes.text}>
          {text}
        </Typography>
      </Typography>
    </div>
  );
};

const useStyles = makeStyles<Theme, ComponentProps>((theme) => ({
  container: {
    marginTop: theme.spacing(0.5),
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  value: {
    fontSize: theme.typography.pxToRem(45),
    fontWeight: 900,
    color: theme.palette.text.primary,
    lineHeight: 1.2
  },
  text: (props) => ({
    marginLeft: props.value === 0 ? 0 : 49, //width and margin of the arrow
    display: 'inline-block',
    textAlign: 'center',
    whiteSpace: 'pre-line'
  }),
  icon: {
    '& svg': {
      maxHeight: '50px',
      fill: theme.palette.text.primary
    },
    margin: '0 auto 10px'
  },
  arrow: {
    display: 'inline-block',
    marginRight: 10,
    verticalAlign: 'text-bottom',
    transform: 'rotate(180deg)',
    '& svg': {
      height: 45,
      width: 39
    }
  },
  arrowDown: {
    transform: 'rotate(0deg)',
    verticalAlign: 'sub'
  },
  arrowNeg: {
    '& svg': {
      fill: theme.palette.error.main
    }
  },
  arrowPoz: {
    '& svg': {
      fill: theme.palette.success.main
    }
  }
}));

export default injectIntl(withLoading(Progress));
