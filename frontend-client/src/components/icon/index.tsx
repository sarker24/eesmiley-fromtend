import * as React from 'react';
import { Component } from 'react';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';

export interface IComponentProps {
  /**
   * Name of icon to load from `/static/icons`
   */
  className?: string;
  icon: string;
}

/**
 * Icon component to display an icon
 */
export class Icon extends Component<IComponentProps> {
  constructor(props: IComponentProps) {
    super(props);
  }

  render() {
    const { className, icon } = this.props;
    const iconClasses = classNames('icon', { [className]: className });

    // eslint-disable-next-line
    return (
      <div className={iconClasses}>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <SVGInline svg={icon} />
      </div>
    );
  }
}
