import * as React from 'react';
import { Button, makeStyles } from '@material-ui/core';
import SortDownIcon from 'icons/sortDown';
import SortUpIcon from 'icons/sortUp';
import classNames from 'classnames';
import { ButtonProps } from '@material-ui/core/Button/Button';

export type SortOrder = 'desc' | 'asc';

interface SortButtonProps extends ButtonProps {
  sortOrder: SortOrder;
  onSortChange: (sortOrder: SortOrder) => void;
}

const SortButton: React.FunctionComponent<SortButtonProps> = (props) => {
  const classes = useStyles(props);
  const { children, sortOrder, className, onSortChange, ...rest } = props;

  const handleOnClick = () => {
    const nextOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    onSortChange(nextOrder);
  };

  return (
    <Button
      variant='outlined'
      className={classNames(classes.root, { [className]: Boolean(className) })}
      {...rest}
      onClick={handleOnClick}
    >
      {sortOrder === 'desc' ? <SortUpIcon /> : <SortDownIcon />}
    </Button>
  );
};

const useStyles = makeStyles({
  root: {
    minWidth: 'initial'
  }
});

export default SortButton;
