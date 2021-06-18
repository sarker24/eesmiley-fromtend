import * as React from 'react';
import { ListItem, makeStyles, MenuItemProps } from '@material-ui/core';
import ListItemCheckbox from 'report/components/Select/components/ListItemCheckbox';

import classNames from 'classnames';

// see https://material-ui.com/guides/typescript/#usage-of-component-prop

export type SelectItemProps<C extends React.ElementType> = {
  checkbox?: boolean;
  disableLookup?: boolean;
  disableHover?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
} & MenuItemProps<C, { component?: C }>;

const SelectItem = <C extends React.ElementType = 'li'>(
  props: SelectItemProps<C>,
  ref: React.Ref<HTMLDivElement>
) => {
  const classes = useStyles(props);
  const {
    className,
    component = 'li',
    onKeyDown,
    checkbox,
    disableLookup,
    disableHover,
    children,
    ...rest
  } = props;

  // Mui Menu listens to onKeyPress and handles auto focusing items based of first letter of item text,
  // Which will make eg input items to lose focus if the pressed key matches first letter of any of the menu items.
  // By stopping the event propagation, the event never reaches the menu component.
  const handleDisableLookup = (event: React.KeyboardEvent) => {
    event.stopPropagation();
  };

  return (
    <ListItem
      className={classNames({
        [classes.disableHover]: Boolean(disableHover),
        [className]: Boolean(className)
      })}
      button
      component={component}
      ref={ref}
      {...rest}
      onKeyDown={disableLookup ? handleDisableLookup : onKeyDown}
    >
      {checkbox && <ListItemCheckbox checked={rest.selected} />}
      {children}
    </ListItem>
  );
};

const useStyles = makeStyles({
  disableHover: {
    '&:hover, &.Mui-focusVisible': {
      backgroundColor: 'initial'
    }
  }
});

export default React.forwardRef(SelectItem);
