import * as React from 'react';
import { Popover } from '@material-ui/core';
import './index.scss';

export interface IComponentProps {
  children: React.ReactNode | React.ReactNode[];
  text?: string;
}

export interface IComponentState {
  open: boolean;
  anchorEl: HTMLDivElement;
}

export default class GuidingStep extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null
    };
  }

  handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  render() {
    const { text, children } = this.props;

    return (
      <div
        className={'guidingStep ' + (this.state.open ? 'open' : 'closed')}
        onClick={this.handleOpen}
        onMouseOver={this.handleOpen}
        onMouseOut={this.handleRequestClose}
      >
        <span>{text}</span>
        <hr />
        {children && (
          <Popover
            className='guidingStepPopover popOver'
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
            onClose={this.handleRequestClose}
          >
            {children}
          </Popover>
        )}
      </div>
    );
  }
}
