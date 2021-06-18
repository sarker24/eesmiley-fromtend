import { InjectedIntlProps, injectIntl } from 'react-intl';
import { TextField } from '@material-ui/core';
import AlertIcon from '@material-ui/icons/ErrorOutline';
import * as React from 'react';
import classNames from 'classnames';
import { unformat, formatNumber, isSeparator } from 'utils/number-format';
import { isInRange, isNumeric } from 'utils/math';
import { InputProps } from '@material-ui/core/Input/Input';
import { getSettings } from 'utils/number-format';
import { escapeRegExp } from 'utils/regexp';

export type BooleanInputTypes = 'checkbox' | 'radio';

export type InputTextOptions = {
  separators: string[];
  decimalPrecision: number;
  allowNegative?: boolean;
  inputMode?: string;
  unit?: string;
};

export interface IOwnProps {
  decimalPrecision?: number;
  name: string;
  type: 'number' | 'text' | 'currency' | 'tel' | 'password';
  value?: string | number;
  disabled?: boolean;
  defaultValue?: string;
  placeholder?: string;

  muiTheme?: any;
  checked?: boolean;

  preventDefault?: boolean;

  min?: number;
  max?: number;

  label?: string;
  className?: string;

  minvalue?: number;
  maxValue?: number;

  focusOnMount?: boolean;
  required?: boolean;
  shouldValidate?: (value: string | number) => boolean;
  customError?: string;
  initialCheck?: boolean;
  autoComplete?: string;
  doNotFormatValue?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>, value: string | number) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  onKeyUp?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  style?: any;
  fullWidth?: boolean;
  InputProps?: InputProps;
}

export type IComponentProps = IOwnProps & InjectedIntlProps;

interface IComponentState {
  hasValue: boolean;
  haveBeenChecked: boolean;
  hasFocus: boolean;
  touched: boolean;
}

const isDigitCharacter = /[-\d,.]/;

const fixDecimal = (value: string) => {
  const latestInput = value.slice(-1);
  if (isSeparator(latestInput)) {
    const { separator } = getSettings();
    return (value.slice(0, -1) || '0') + separator.decimal;
  }
  return value;
};

/**
 * Input field component
 */
export class Input extends React.PureComponent<IComponentProps, IComponentState> {
  readonly ref: React.RefObject<HTMLInputElement>;

  constructor(props: IComponentProps) {
    super(props);

    this.ref = React.createRef();

    this.state = {
      hasValue:
        props.value &&
        ((props.type == 'number' && !isNaN(props.value as number)) ||
          (props.value && (props.value as string).length > 0)),
      haveBeenChecked: props.initialCheck || (this.state && this.state.haveBeenChecked),
      hasFocus: false,
      touched: false
    };
  }

  errorCheck = (value: string | number) => {
    const { required, intl, shouldValidate, customError, type, min, max } = this.props;

    if (required && (!value || value === '')) {
      return intl.messages['generic.input.requiredError'];
    }

    if (shouldValidate != undefined) {
      if (!shouldValidate(value)) {
        if (customError) {
          return customError;
        }
        return intl.messages['generic.input.error'];
      }
    }

    if (type == 'number' || type == 'tel') {
      if (isNumeric(value)) {
        const numberValue = parseInt(value as string);
        if (!isInRange({ value: numberValue, min, max })) {
          return intl.messages['generic.input.rangeError'];
        }
      }
    }

    return null;
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { preventDefault, onChange, type, decimalPrecision = 2 } = this.props;
    const {
      target: { value }
    } = e;

    if (e && e.preventDefault && preventDefault) {
      e.preventDefault();
    }

    const valueString = type === 'number' ? fixDecimal(String(value)) : String(value);
    const { separator } = getSettings();
    const lastCharacter = valueString.slice(-1);
    // todo: expand type with weight / currency and read decimals from number-format
    const hasMaxDecimals = new RegExp(
      `${escapeRegExp(separator.decimal)}\\d{${decimalPrecision + 1},}$`
    );

    if (type === 'number' && valueString !== '') {
      const trailingDecimalZero = new RegExp(
        `${escapeRegExp(separator.decimal)}0{0,${decimalPrecision}}$`,
        'g'
      );

      if (decimalPrecision === 0 && /[^\d]/.test(lastCharacter)) {
        return;
      }

      if (!isDigitCharacter.test(lastCharacter) || hasMaxDecimals.test(valueString)) {
        return;
      }

      if (lastCharacter != '-' && !trailingDecimalZero.test(valueString)) {
        onChange(e, unformat(valueString));
        return;
      }
    }

    this.setState({
      haveBeenChecked: true,
      hasValue: Boolean(valueString && valueString !== '')
    });

    onChange(e, valueString);
  };

  componentDidMount() {
    const { focusOnMount } = this.props;
    if (focusOnMount) {
      if (this.ref.current) {
        this.ref.current.focus();
      }
    }
  }

  parseType = (type) => {
    switch (type) {
      case 'number':
      case 'tel':
        return 'tel';
      case 'password':
        return 'password';
      default:
        return 'text';
    }
  };

  parseValue = ({
    type,
    value,
    doNotFormatValue
  }: {
    type: string;
    value: string | number;
    doNotFormatValue: boolean;
  }): string | number => {
    if (type !== 'number' || value === '' || doNotFormatValue) {
      return value;
    }
    return formatNumber(value);
  };

  render() {
    const {
      intl,
      doNotFormatValue,
      type,
      shouldValidate,
      customError,
      value,
      className,
      focusOnMount,
      onChange,
      onFocus,
      onBlur,
      children,
      ...other
    } = this.props;
    const parsedType = this.parseType(type);
    const parsedValue = this.parseValue({ type, value, doNotFormatValue });
    const { hasValue, hasFocus, touched, haveBeenChecked } = this.state;
    const hasError = touched && this.errorCheck(value);

    const errorMessage =
      (hasError && hasValue && (onFocus || onChange || onBlur)) ||
      (hasError && haveBeenChecked) ||
      (!hasValue && haveBeenChecked) ||
      (value !== undefined && value !== '' && haveBeenChecked)
        ? hasError
        : null;

    const inputClassNames = classNames(
      'input',
      {
        'is-active': hasValue,
        'is-focused': hasFocus,
        'has-error': hasError,
        'has-touched': touched
      },
      [className]
    );

    return (
      <TextField
        inputRef={this.ref}
        className={inputClassNames}
        type={parsedType}
        error={Boolean(errorMessage)}
        InputProps={errorMessage ? { endAdornment: <AlertIcon color={'error'} /> } : {}}
        helperText={errorMessage}
        id={other.name}
        value={parsedValue}
        onChange={this.onChange}
        onBlur={(e) => {
          this.errorCheck(value);
          this.setState(
            {
              hasFocus: false,
              touched: true
            },
            () => {
              onBlur && onBlur(e);
            }
          );
        }}
        onFocus={(e) => {
          this.setState(
            {
              hasFocus: true
            },
            () => {
              onFocus && onFocus(e);
            }
          );
        }}
        {...other}
      />
    );
  }
}

export default injectIntl(Input, { withRef: true });
