import * as React from 'react';
import { Icon, IconButton, Tooltip, Button } from '@material-ui/core';

interface CustomTableActionProps {
  action: any;
  data?: any;
  size?: 'small' | 'medium';
  buttonTitleAdd?: string;
}

class CustomTableAction extends React.Component<CustomTableActionProps> {

  render() {
    const { action = {}, data = {} } = this.props;
    const internalAction = typeof action === 'function' ? action(data) : action;

    if (!internalAction || internalAction.hidden) {
      return null;
    }

    const handleOnClick = event => {
      if (internalAction.onClick) {
        internalAction.onClick(event, data);
        event.stopPropagation();
      }
    };

    internalAction.tooltip = internalAction.isFreeAction && internalAction.tooltip === 'Add' ? false : internalAction.tooltip;
    const button = (
      <span>
        {internalAction.isFreeAction ?
          <Button
            variant={'contained'}
            color={'primary'}
            size={'small'}
            disabled={internalAction.disabled}
            onClick={(event) => handleOnClick(event)}
          >
            <action.icon
              {...internalAction.iconProps}
              disabled={action.disabled}
            />
            {this.props.buttonTitleAdd}
          </Button>
          :
          <IconButton
            size={this.props.size}
            color='inherit'
            disabled={internalAction.disabled}
            onClick={(event) => handleOnClick(event)}
          >
            {typeof internalAction.icon === 'string' ? (
              <Icon {...internalAction.iconProps}>{internalAction.icon}</Icon>
            ) : (
              <internalAction.icon
                {...internalAction.iconProps}
                disabled={internalAction.disabled}
              />
            )
            }
          </IconButton>
        }
      </span>
    );

    if (internalAction.tooltip) {
      return <Tooltip title={internalAction.tooltip}>{button}</Tooltip>;
    } else {
      return button;
    }
  }
}

export default CustomTableAction;
