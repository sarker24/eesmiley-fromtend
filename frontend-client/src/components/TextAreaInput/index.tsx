import { TextField, TextFieldProps } from '@material-ui/core';
import * as React from 'react';
import debounce from 'lodash/debounce';
import { makeStyles } from '@material-ui/styles';

interface OwnProps {
  value?: string;
  onChange: (value: string) => void;
  debounceTimeoutMs?: number;
  maxLength?: number;
}

type TextAreaInputProps = Omit<TextFieldProps, 'onChange'> & OwnProps;

const useStyles = makeStyles({
  helperText: {
    display: 'flex',
    justifyContent: 'space-between'
  }
});

const TextAreaInput: React.FunctionComponent<TextAreaInputProps> = (props) => {
  const classes = useStyles(props);
  const { value, onChange, maxLength, debounceTimeoutMs = 800, ...inputProps } = props;
  const [draft, setDraft] = React.useState<string>(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (maxLength && value.length > maxLength) {
      return;
    }
    setDraft(e.target.value);
  };

  const updateValue = (value) => {
    onChange(value);
  };

  // w/o useCallback, we will have multiple instances whenever prop changes
  const debouncedOnChange = React.useCallback(debounce(updateValue, debounceTimeoutMs), []);

  React.useEffect(() => {
    if (draft !== value) {
      debouncedOnChange(draft);
    }
  }, [draft]);

  return (
    <TextField
      {...(inputProps as TextFieldProps)}
      value={draft}
      onChange={handleChange}
      FormHelperTextProps={{ className: classes.helperText }}
      helperText={
        <span>
          {draft.length}/{maxLength}
        </span>
      }
    />
  );
};

export default TextAreaInput;
