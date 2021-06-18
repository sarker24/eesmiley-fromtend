import { Tooltip, TableCell, TableSortLabel } from '@material-ui/core';
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';

interface HeaderCellProps {
  tooltip?: React.ReactNode;
  alignRight?: boolean;
  active?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  direction?: 'desc' | 'asc';
  onClick?: () => void;
  colSpan?: number;
  className?: string;
}

const HeaderCell: React.FunctionComponent<HeaderCellProps> = (props: HeaderCellProps) => {
  const { tooltip, children, alignRight, active, direction, onClick, ...rest } = props;

  const classes = useStyles(props);
  const label = (
    <TableSortLabel active={active} direction={direction} onClick={onClick}>
      {children}
    </TableSortLabel>
  );

  return (
    <TableCell {...rest} align={alignRight ? 'right' : 'left'} className={classes.root}>
      {!tooltip ? (
        label
      ) : (
        <Tooltip
          title={tooltip}
          placement={alignRight ? 'bottom-end' : 'bottom-start'}
          enterDelay={300}
        >
          {label}
        </Tooltip>
      )}
    </TableCell>
  );
};

const useStyles = makeStyles<HeaderCellProps>({
  root: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: '12px',
    fontWeight: 500
  }
});

export default HeaderCell;
