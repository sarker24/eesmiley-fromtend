import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Icon } from 'icon';
import classNames from 'classnames';
import { formatWeight, formatMoney } from 'utils/number-format';
import { Basis, Dimension } from 'redux/ducks/reports-new';
import arrowDownImage from 'static/icons/arrow-down-solid.svg';
import withLoading, { WithLoadingProps } from 'LoadingPlaceholder/withLoading';

interface ComponentProps extends InjectedIntlProps, WithLoadingProps {
  title?: React.ReactNode;
  icon?: React.ReactElement;
  value: number | string;
  unit?: string;
  message?: {
    text: string | React.ReactElement;
    progressValue?: number;
    invertedProgress?: boolean;
  };
  formatValue?: boolean;
  dimension?: Dimension;
  basis?: Basis;
  disabled?: boolean;
}

const Fact: React.FunctionComponent<ComponentProps> = (props) => {
  const classes = useStyles(props);
  const {
    title,
    icon,
    value,
    dimension,
    basis,
    unit,
    formatValue,
    message: { progressValue, text, invertedProgress } = {
      progressValue: undefined,
      text: undefined,
      invertedProgress: false
    },
    intl
  } = props;
  //FIXME: Figure out a better way to format the values, cause this ain't pretty
  const formattedValue =
    typeof value === 'number'
      ? formatValue
        ? dimension === 'cost'
          ? formatMoney(value).toString()
          : basis === 'per-guest'
          ? formatWeight(value, true, 'g')
          : formatWeight(value)
        : intl.formatNumber(value, { maximumFractionDigits: 2 }) + (unit ? ' ' + unit : '')
      : value;
  const arrowClasses = classNames(
    classes.arrow,
    progressValue < 0 && classes.arrowDown,
    progressValue < 0
      ? invertedProgress
        ? classes.arrowPoz
        : classes.arrowNeg
      : invertedProgress
      ? classes.arrowNeg
      : classes.arrowPoz
  );

  return (
    <div className={classes.container}>
      <Typography variant={'h3'} className={classes.title} align={'center'}>
        {title}
      </Typography>
      {icon && React.cloneElement(icon, { className: classes.icon })}
      <>
        <Typography component={'span'} className={classes.value} align={'center'}>
          {formattedValue}
        </Typography>
        <Typography component={'span'} className={classes.progress} align={'center'}>
          {typeof progressValue !== 'undefined' && progressValue !== 0 && (
            <Icon icon={arrowDownImage} className={arrowClasses} />
          )}
          {text}
        </Typography>
      </>
    </div>
  );
};

const useStyles = makeStyles<Theme, ComponentProps>((theme) => ({
  container: (props) => ({
    opacity: props.disabled && 0.1,
    marginTop: theme.spacing(0.5)
  }),
  title: {
    fontSize: '1rem',
    lineHeight: '1.2',
    margin: theme.spacing(0.5, 0, 2),
    [theme.breakpoints.up('sm')]: {
      minHeight: '2.5rem'
    }
  },
  value: {
    fontSize: theme.typography.pxToRem(35),
    lineHeight: theme.typography.pxToRem(42),
    fontWeight: 900,
    color: theme.palette.text.primary,
    marginTop: theme.spacing(2),
    display: 'block'
  },
  progress: {
    color: theme.palette.grey[400],
    display: 'block',
    whiteSpace: 'pre-line',
    marginTop: 5
  },
  progressValue: {
    fontWeight: 900,
    color: theme.palette.text.secondary
  },
  icon: {
    margin: '0 auto 10px',
    textAlign: 'center',

    '& svg': {
      maxHeight: '50px',
      width: 62,
      fill: theme.palette.text.primary
    }
  },
  arrow: {
    display: 'inline-block',
    marginRight: 5,
    verticalAlign: 'text-top',
    transform: 'rotate(180deg)',
    '& svg': {
      height: 14,
      width: 12
    }
  },
  arrowDown: {
    transform: 'rotate(0deg)',
    verticalAlign: 'text-bottom'
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
  },
  loader: {
    width: 40,
    height: 40,
    display: 'block',
    margin: '50px auto 0'
  }
}));

export default injectIntl(withLoading(Fact));
