import * as React from 'react';
import { Popover } from '@material-ui/core';

export interface OwnProps {
  trends: { className: string; text: string; periodLabel: string }[];
}

export interface IComponentState {
  anchorEl: HTMLElement;
  popoverText?: string;
  periodLabel?: string;
  trend: { className: string; text: string; periodLabel: string }[];
}

type ITrendBarProps = OwnProps;

class TrendBar extends React.Component<ITrendBarProps, IComponentState> {
  constructor(props: ITrendBarProps) {
    super(props);
    this.state = {
      anchorEl: null,
      popoverText: '',
      periodLabel: '',
      trend: []
    };
  }

  handlePopoverOpen = (anchorEl: HTMLElement, text: string, periodLabel: string): void => {
    this.setState((prev) => ({ ...prev, anchorEl, popoverText: text, periodLabel: periodLabel }));
  };

  handlePopoverClose = (): void => {
    this.setState({ anchorEl: null, popoverText: '', periodLabel: '' });
  };

  render() {
    const { trends } = this.props;
    const { anchorEl, popoverText, periodLabel } = this.state;

    return (
      <div>
        <Popover
          className='trendPopover'
          onClose={this.handlePopoverClose}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
          transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        >
          <div style={{ textAlign: 'right', padding: '8px' }}>
            <span>{periodLabel}</span>
            <br />
            <span>{popoverText}</span>
          </div>
        </Popover>
        <div className='trendBar' onMouseLeave={this.handlePopoverClose}>
          {trends.map((trend, index: number) => {
            return (
              <div
                key={index}
                className={`trend ${trend.className}`}
                onMouseEnter={(e) => {
                  const anchorEl = e.currentTarget;
                  this.handlePopoverOpen(anchorEl, trend.text, trend.periodLabel);
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default TrendBar;
