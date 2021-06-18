import * as React from 'react';
import SettingsIcon from '@material-ui/icons/Settings';
import CheckIcon from '@material-ui/icons/Check';
import ErrorIcon from '@material-ui/icons/Error';
import { CSSTransitionGroup } from 'react-transition-group';
import { Button, createStyles, withStyles, WithStyles } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';

const styles = createStyles({
  widgetButton: {
    position: 'absolute',
    padding: '4px',
    minWidth: 'auto',
    zIndex: 10, // chart content might overlap otherwise
    top: 0,
    right: 0,
    '& svg': {
      fill: '#ffffff'
    }
  }
});

interface OwnProps {
  editMode?: boolean;
  setEditMode: (id: string, isEnabled: boolean) => void;
  id: string;
}

interface WidgetSettingsButtonState {
  justSavedSettings: boolean;
  encounteredError?: boolean;
}

type WidgetSettingsButtonProps = InjectedIntlProps & WithStyles<typeof styles> & OwnProps;

class WidgetSettingsButton extends React.Component<
  WidgetSettingsButtonProps,
  WidgetSettingsButtonState
> {
  constructor(props: WidgetSettingsButtonProps) {
    super(props);

    this.state = {
      justSavedSettings: false
    };
  }

  showWidgetSettingsNotification = (encounteredError?: boolean): void => {
    this.setState({
      justSavedSettings: true,
      encounteredError: encounteredError
    });

    setTimeout(() => {
      this.setState({
        justSavedSettings: false
      });
    }, 3000);
  };

  render() {
    const { setEditMode, editMode, intl, id, classes } = this.props;
    const { justSavedSettings, encounteredError } = this.state;

    return (
      <span>
        <CSSTransitionGroup
          transitionName='fadeOut'
          transitionLeave={!editMode}
          transitionEnter={true}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={5000}
        >
          {!editMode &&
            justSavedSettings &&
            (encounteredError ? (
              <span className='widgetSettingsNotification encounteredError'>
                <ErrorIcon />
                {intl.messages['error.title']}
              </span>
            ) : (
              <span className='widgetSettingsNotification success'>
                <CheckIcon />
                {intl.messages['settings.basic.saved']}
              </span>
            ))}
        </CSSTransitionGroup>
        {!editMode && (
          <Button
            variant='contained'
            color='primary'
            className={classes.widgetButton}
            onMouseEnter={(e: React.MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e: React.MouseEvent) => {
              setEditMode(id, true);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <SettingsIcon />
          </Button>
        )}
      </span>
    );
  }
}

export default injectIntl(withStyles(styles)(WidgetSettingsButton), { withRef: true });
