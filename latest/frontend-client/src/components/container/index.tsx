import * as React from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import classNames from 'classnames';
import './index.scss';

/**
 * The properties of the Container Component
 */
export interface IComponentProps {
  /**
   * Title of the container
   */
  title?: string | JSX.Element;

  /**
   * Wrapping children (required) (though marked as optional)
   */
  children?: React.ReactNode | React.ReactNode[];

  /**
   * Additional classNames to add to the element
   */
  className?: string | [string];

  foldable?: boolean;

  startsOpen?: boolean;

  mustOverflow?: boolean;
}

export interface IComponentState {
  isOpen?: boolean;
}

/**
 * Basic Container component
 */
export default class Container extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      isOpen: props.foldable ? props.startsOpen : true
    };
  }

  render() {
    const { children, title, className, foldable, mustOverflow, ...rest } = this.props;

    const containerClassName = classNames(
      'container',
      { foldable: foldable, 'is-open': this.state.isOpen },
      [className]
    );

    return (
      <fieldset className={containerClassName} {...rest}>
        <legend
          className='containerHeader'
          onClick={() => {
            this.setState(Object.assign({}, this.state, { isOpen: !this.state.isOpen }));
          }}
        >
          {title ? (
            <h4 className='containerTitle'>
              {title}
              {foldable ? <ArrowDropDownIcon /> : null}
            </h4>
          ) : foldable ? (
            <ArrowDropDownIcon />
          ) : null}
        </legend>
        <div className={`containerContent ${mustOverflow ? 'mustOverflow' : ''}`}>{children}</div>
      </fieldset>
    );
  }
}
