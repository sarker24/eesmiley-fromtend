import * as React from 'react';

import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Checkbox as MuiCheckbox, ListItemIcon, makeStyles } from '@material-ui/core';
import { CheckboxProps } from '@material-ui/core/Checkbox/Checkbox';

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
const checkedIcon = <CheckBoxIcon fontSize='small' color='primary' />;

const ListItemCheckbox: React.FunctionComponent<CheckboxProps> = (props) => {
  const classes = useStyles(props);
  const { checked, value, ...rest } = props;

  return (
    <ListItemIcon>
      <MuiCheckbox
        classes={{ root: classes.checkbox }}
        edge='start'
        disableRipple
        color='primary'
        size='small'
        {...rest}
        checked={checked}
        icon={icon}
        checkedIcon={checkedIcon}
      />
    </ListItemIcon>
  );
};

const useStyles = makeStyles({
  /* listitem handles padding */
  checkbox: {
    paddingTop: 0,
    paddingBottom: 0,

    '&:hover': {
      background: 'initial'
    }
  }
});

export default ListItemCheckbox;
