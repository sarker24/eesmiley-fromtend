import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { Icon } from 'icon';
import classNames from 'classnames';
import backspaceImage from 'static/icons/backspace-solid.svg';

// TODO: setup properly with theming
const black89h = '#333333';
const black65p = '#595959';
const customGray = '#e1e1e1';

const noValue = '-';
const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

export interface KeypadProps {
  disabled: boolean;
  value?: number;
  label?: React.ReactNode;
  className?: string;
  onClearPrevious: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onAddNumber: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const KeyPad: React.FunctionComponent<KeypadProps> = (props) => {
  const classes = styles(props);
  const { className, label, disabled = false, onClearPrevious, onAddNumber, value } = props;

  return (
    <div className={classNames(classes.root, { [className]: !!className })}>
      <span className={classes.label}>{label}</span>
      <span className={classes.input}>{value || noValue}</span>
      <div className={classes.keys}>
        {keys.map((key) => (
          <button
            disabled={disabled}
            key={key}
            className={classes.keyButton}
            onClick={onAddNumber}
            value={key}
          >
            {key}
          </button>
        ))}
        <button disabled={disabled} className={classes.keyButton} onClick={onClearPrevious}>
          <Icon className={classes.icon} icon={backspaceImage} />
        </button>
      </div>
    </div>
  );
};

const fixedHeightQuery = '@media screen and (min-height: 1024px)';
const styles = makeStyles<Theme, KeypadProps>((theme) => ({
  root: {
    backgroundColor: black89h,
    display: 'flex',
    flexFlow: 'column nowrap',
    '&> * + *': {
      marginTop: '2vh'
    }
  },
  label: {
    color: '#ffffff',
    fontSize: '15px'
  },
  input: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    color: black65p,
    padding: '1vh 0.5vh',
    borderRadius: '5px',
    fontSize: '30px',
    textAlign: 'center',
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      fontSize: '20px'
    },
    [fixedHeightQuery]: {
      padding: '16px 10px'
    }
  },
  keys: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between'
  },
  keyButton: {
    fontSize: '18px',
    width: '32%',
    flex: '0 0 auto',
    border: 0,
    borderRadius: '5px',
    backgroundColor: black65p,
    color: customGray,
    padding: '1.8vh 1.4vh',
    marginTop: '2%',
    cursor: 'pointer',
    '&:nth-last-child(2)': {
      width: '66%'
    },
    '&:focus': {
      outline: 'none'
    },
    '&:active': {
      backgroundColor: black89h
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '12px'
    },
    [fixedHeightQuery]: {
      padding: '16px 10px'
    }
  },
  icon: {
    width: '18px',
    height: '18px',
    margin: 'auto',
    [theme.breakpoints.down('xs')]: {
      width: '12px',
      height: '12px'
    }
  }
}));

export default KeyPad;
