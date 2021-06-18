import { Typography } from '@material-ui/core';
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';

export interface CardHeaderProps {
  title: string;
  titleHelpIcon?: React.ReactElement;
}

const useStyles = makeStyles({
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px'
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: 600
  }
});

/*
          <HelpText helpText={intl.messages['help.settings.enableRegistrationComments']} />


 */

const CardHeader: React.FunctionComponent<CardHeaderProps> = (props) => {
  const classes = useStyles(props);
  const { title, titleHelpIcon } = props;

  return (
    <div className={classes.cardHeader}>
      <Typography className={classes.title} component='h4'>
        {title}
      </Typography>
      {titleHelpIcon && titleHelpIcon}
    </div>
  );
};

export default CardHeader;
