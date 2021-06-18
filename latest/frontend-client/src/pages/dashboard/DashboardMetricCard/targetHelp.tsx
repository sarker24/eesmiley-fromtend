import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import { Link } from 'react-router';
import { HelpContent } from 'redux/ducks/tutorials/types';
import { Button } from '@material-ui/core';
import { resetStep } from 'redux/ducks/tutorials';
import { updateFilter as setSettingsPage } from 'redux/ducks/settings';
import { connect } from 'react-redux';

const useStyles = makeStyles({
  icon: {
    verticalAlign: 'bottom'
  }
});

type DispatchProps = typeof mapDispatchToProps;
const mapDispatchToProps = { resetStep, setSettingsPage };

const TargetHelpContent = connect<unknown, DispatchProps, unknown>(
  null,
  mapDispatchToProps
)((props) => {
  const { resetStep, setSettingsPage } = props;
  const classes = useStyles();

  const handleClick = () => {
    setSettingsPage('targets');
    resetStep();
  };

  return (
    <FormattedMessage
      id='tutorial.howToDefineTarget.content'
      values={{
        settingsIcon: <SettingsIcon fontSize='small' className={classes.icon} />,
        button: (
          <Button
            color='primary'
            variant='contained'
            component={Link}
            to='/settings'
            onClick={handleClick}
          >
            target settings
          </Button>
        )
      }}
    />
  );
});

const targetHelp: HelpContent = {
  title: <FormattedMessage id='tutorial.howToDefineTarget.title' />,
  content: <TargetHelpContent />
};

export default targetHelp;
