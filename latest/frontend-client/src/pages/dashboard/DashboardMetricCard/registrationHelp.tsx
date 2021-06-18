import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import ScaleIcon from 'components/icons/scale';
import { makeStyles } from '@material-ui/core/styles';
import { HelpContent } from 'redux/ducks/tutorials/types';

const useStyles = makeStyles({
  icon: {
    verticalAlign: 'bottom'
  }
});

const RegistrationHelpContent: React.FunctionComponent = () => {
  const classes = useStyles();
  return (
    <FormattedMessage
      id='tutorial.howToRegister.content'
      values={{ scaleIcon: <ScaleIcon fontSize='small' className={classes.icon} /> }}
    />
  );
};

const registrationHelp: HelpContent = {
  title: <FormattedMessage id='dashboard.register_foodwaste' />,
  content: <RegistrationHelpContent />
};

export default registrationHelp;
