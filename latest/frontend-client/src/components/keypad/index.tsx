import * as React from 'react';
import { stringToInteger } from 'utils/math';
import Keypad, { KeypadProps } from 'keypad/Keypad';

const maxNumber = 9999999;

type MaybeNumber = number | null;

export interface KeypadContainerProps extends Omit<KeypadProps, 'onAddNumber' | 'onClearPrevious'> {
  onChange?: (value: number) => void;
}

const KeyPadContainer: React.FunctionComponent<KeypadContainerProps> = (props) => {
  const { onChange, value, ...keypadProps } = props;

  function handleClearPrevious(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (!value) {
      return;
    }

    const previousValue: MaybeNumber = stringToInteger(value.toString().slice(0, -1));
    onChange(previousValue);
  }

  function handleAddNumber(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (value && value >= maxNumber) {
      return;
    }

    const digit = (event.target as HTMLInputElement).value;
    const nextValue: MaybeNumber = stringToInteger(value ? `${value}${digit}` : digit);
    onChange(nextValue);
  }

  return (
    <Keypad
      {...keypadProps}
      value={value}
      onAddNumber={handleAddNumber}
      onClearPrevious={handleClearPrevious}
    />
  );
};

export default KeyPadContainer;
