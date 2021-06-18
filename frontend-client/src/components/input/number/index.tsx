import * as React from 'react';
// https://github.com/yahoo/react-intl/issues/831
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { TextField } from '@material-ui/core';
import { getSettings } from 'utils/number-format';

interface NumberInputProps extends NumberFormatProps {
  allowNegative: boolean;
  value: string | number;
  shouldValidate?: () => boolean;
  component?: React.ComponentType;
  className?: string;
  required?: boolean;

  [prop: string]: any;
}

const allowedDecimalSeparators = [',', '.'];

function NumberInput({
  autoFocus,
  component: CustomInput,
  shouldValidate,
  ...rest
}: NumberInputProps) {
  const { decimal: decimalSeparator, thousand: thousandSeparator } = getSettings().separator;
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let timeout;
    if (autoFocus && inputRef.current && !timeout) {
      // zero delay setTimeout to run after browser "focus" action finishes
      timeout = setTimeout(() => {
        const input: HTMLInputElement = inputRef.current.querySelector('.MuiInput-input');
        const pos = input.value.length;
        input.focus();
        input.setSelectionRange(pos, pos);
      });
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [inputRef.current]);

  return (
    <NumberFormat
      getInputRef={inputRef}
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      allowedDecimalSeparators={allowedDecimalSeparators}
      customInput={TextField}
      decimalScale={2}
      inputMode={'decimal'}
      // For the Input component, we need to add inputMode here as well, otherwise it won't get applied from the line above
      // suggests for client device to show number keypad only (with optional - button)
      inputProps={!CustomInput ? { inputMode: 'decimal' } : undefined}
      {...rest}
    />
  );
}

export default NumberInput;
