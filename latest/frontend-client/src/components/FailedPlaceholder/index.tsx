import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Typography, Button } from '@material-ui/core';
import SVGInline from 'react-svg-inline';
import RefreshIcon from '@material-ui/icons/Refresh';
import * as React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

import BowlSvg from 'static/bowl.svg';

interface OwnProps {
  title?: string;
  description?: string;
  retryHandler?: () => any;
  className?: string;
}

type FailedPlaceholderProps = OwnProps & InjectedIntlProps;

export const FailedPlaceholder: React.FunctionComponent<FailedPlaceholderProps> = (
  props: FailedPlaceholderProps
) => {
  const { title, description, retryHandler, className, intl, ...rest } = props;

  const classes = useStyles(props);

  return (
    <div
      {...rest}
      className={classNames('placeholder', classes.container, {
        [className]: !!className
      })}
    >
      <SVGInline height={'125px'} width={'100px'} svg={BowlSvg} />
      <Typography variant='body1' gutterBottom>
        {title || intl.messages['base.failed.title']}
      </Typography>
      <Typography variant='subtitle1' align='center' gutterBottom>
        {description || intl.messages['base.failed.description']}
      </Typography>
      {retryHandler && (
        <Button startIcon={<RefreshIcon />} onClick={retryHandler}>
          {intl.messages['base.retry']}
        </Button>
      )}
    </div>
  );
};

const useStyles = makeStyles(
  {
    container: {
      backgroundColor: '#eeeeee',
      display: 'flex',
      padding: 24,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  { name: 'FailedPlaceholder' }
);

export default injectIntl(FailedPlaceholder);
