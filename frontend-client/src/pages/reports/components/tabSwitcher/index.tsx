import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';

const classNames: Function = require('classnames');
import { injectIntl } from 'react-intl';

require('./index.scss');

export interface IComponentProps {
  value: any;
  required?: boolean;
  onChange?: Function;
  children: any[];
  placeholder?: any;
  onReset: Function;
}

export interface IComponentState {
  value: any;
}

class TabSwitcher extends React.Component<IComponentProps, IComponentState> {

  static defaultProps = {
    value: null,
    placeholder: 'N/A'
  };
  indicatorRef: React.RefObject<any>;

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.moveIndicator = this.moveIndicator.bind(this);
    this.indicatorRef = React.createRef();
  }

  componentDidUpdate() {
    this.moveIndicator();
  }

  onChange(value: any) {

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  shouldShowPlaceholder() {
    const { required, onReset, value } = this.props;

    if (required) {
      return false;
    }

    return value === null || value === undefined || onReset !== undefined;
  }

  moveIndicator() {

    const { children, value } = this.props;
    const hasPlaceholder = this.shouldShowPlaceholder();

    if (this.indicatorRef.current) {
      let idx = hasPlaceholder ? 0 : -1;
      const len = hasPlaceholder ? children.length + 1 : children.length;
      this.indicatorRef.current.style.width = (value == null || value == undefined ? 23 : (len > 0 ? (100 / len) : 100)) + '%';

      if (hasPlaceholder && (value === undefined || value === null)) {
        this.indicatorRef.current.style.transform = `translate3d(0, 0, 0)`;
      } else {

        for (let i in children) {
          const childValue = (children[i].props.value != undefined ? children[i].props.value : children[i].props.children);
          idx += 1;
          const indicatorXPosition = 100 * idx;

          if (value === childValue) {
            this.indicatorRef.current.style.transform = `translate3d(${indicatorXPosition}%, 0, 0)`;
            break;
          }
        }
      }
    }
  }

  componentDidMount() {
    this.moveIndicator();
  }

  render() {

    const { children, placeholder, onReset, value } = this.props;

    return (
      <div className={classNames('tabSwitcher', { ['hasValue']: value !== null && value !== undefined })}>
        <FlatButton
          className={classNames('tab placeholderTab', {
            ['active']: value === null || value === undefined,
            ['hidden']: !this.shouldShowPlaceholder()
          })}
          label={placeholder}
          disabled={!onReset}
        />
        {
          children.map((child, index) => {
            const { children, ...childRest } = child.props;
            return (
              <FlatButton
                key={index}
                onClick={(e) => {
                  if (child.props.onClick != null) {
                    child.props.onClick(e);
                  } else {
                    this.onChange(child.props.value !== undefined ? child.props.value : child.props.children);
                  }
                }}
                className={classNames('tab', { ['active']: value === (child.props.value !== undefined ? child.props.value : child.props.children) })}
                label={child.props.children} {...childRest} />
            );
          })
        }
        <div className='indicator' ref={this.indicatorRef}/>
      </div>
    );
  }
}

export default injectIntl(TabSwitcher);
