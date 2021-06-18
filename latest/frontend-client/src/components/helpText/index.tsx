import * as React from 'react';
import Info from 'components/icons/infoOutline';
import { IconButton, Paper, Popover } from '@material-ui/core';
import './index.scss';

export interface IComponentProps {
  helpText: string;
  visible?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  size?: 'small' | 'medium';
}

export interface IComponentState {
  anchorEl: HTMLButtonElement | null;
}

export default class HelpText extends React.Component<IComponentProps, IComponentState> {
  public static defaultProps: IComponentProps = {
    visible: true,
    helpText: 'Help'
  };

  state: IComponentState = {
    anchorEl: null
  };

  showMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  render() {
    const { visible, helpText, size, children } = this.props;
    const { anchorEl } = this.state;
    return (
      <div className='helpWrapper'>
        {children}
        <div className='helpAnchor'>
          {visible ? (
            <IconButton size={size} className='helpIconBtn' onClick={this.showMenu}>
              <Info className='helpIcon' />
            </IconButton>
          ) : null}
        </div>
        {visible && anchorEl ? (
          <Popover
            className='helpContainerWrapper'
            onClose={() => this.setState({ anchorEl: null })}
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          >
            <Paper className='helpContainer'>
              {helpText && Array.isArray(helpText)
                ? helpText.map((text: string, index: number) => {
                    return <p key={`text_${index}`}>{text}</p>;
                  })
                : helpText
                ? helpText
                : null}
            </Paper>
          </Popover>
        ) : null}
      </div>
    );
  }
}
