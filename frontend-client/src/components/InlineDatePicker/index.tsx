import * as React from 'react';
import { Button, ButtonGroup, Dialog } from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { makeStyles } from '@material-ui/core/styles';
import moment, { Moment } from 'moment';
import { DatePicker } from '@material-ui/pickers';

export interface InlineDatePickerProps {
  color?: 'primary' | 'secondary' | undefined;
  size?: 'small' | 'medium';
  labelFormat?: string;
  value: Moment;
  onChange: (value: Moment) => void;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  dateButton: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minWidth: '180px'
  },
  dateLabel: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  fixedWidth: {
    flex: 0
  }
}));

const InlineDatePicker: React.FunctionComponent<InlineDatePickerProps> = (props) => {
  const { value, className, color, size = 'medium', labelFormat = 'L', onChange } = props;
  const classes = useStyles(props);
  const [isOpen, setOpen] = React.useState<boolean>(false);

  const handlePrevious = () => {
    onChange(moment(value).subtract(1, 'day'));
  };

  const handleNext = () => {
    onChange(moment(value).add(1, 'day'));
  };

  const handleMenuClick = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      <ButtonGroup className={className} size={size} color={color} variant='outlined' fullWidth>
        <Button className={classes.fixedWidth} onClick={handlePrevious}>
          <KeyboardArrowLeftIcon />
        </Button>
        <Button
          classes={{ label: classes.dateLabel }}
          fullWidth
          className={classes.dateButton}
          type='button'
          onClick={handleMenuClick}
          variant='outlined'
        >
          {value.format(labelFormat)}
        </Button>
        <Button className={classes.fixedWidth} onClick={handleNext}>
          <KeyboardArrowRightIcon />
        </Button>
      </ButtonGroup>
      <Dialog open={isOpen} onClose={() => setOpen(false)}>
        <div>
          <DatePicker disableFuture value={value} onChange={onChange} variant='static' />
        </div>
      </Dialog>
    </>
  );
};

export default InlineDatePicker;
