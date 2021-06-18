import { InjectedIntlProps, injectIntl } from 'react-intl';
import { createStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Spinner from 'LoadingPlaceholder/Spinner';

interface OwnProps {
  title?: string;
  classes?: { [className: string]: string };
  className?: string;
}

type LoadingPlaceHolderProps = InjectedIntlProps & OwnProps;

function LoadingPlaceHolder({ title, classes, className, intl }: LoadingPlaceHolderProps) {
  return (
    <div
      className={classNames('placeholder', classes.container, {
        [className]: !!className
      })}
    >
      <Spinner />
      <Typography variant='h6' className={classes.title}>
        {title || intl.messages['base.loading']}
      </Typography>
    </div>
  );
}

const styles = createStyles({
  container: {
    backgroundColor: '#eeeeee',
    display: 'flex',
    padding: 24,
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontWeight: 600,
    textShadow: '0px 0px 2px rgba(34, 34, 34, 0.3)',
    marginTop: '2em !important'
  }
});

export default withStyles(styles)(injectIntl(LoadingPlaceHolder));
export { Spinner };
