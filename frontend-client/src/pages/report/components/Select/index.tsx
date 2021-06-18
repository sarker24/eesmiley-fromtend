import * as React from 'react';
import { Button, Menu, MenuProps, Typography } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button/Button';
import { ArrowDropDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

interface SelectProps {
  closeOnSelect?: boolean;
  renderValue: () => React.ReactNode;
  buttonProps?: Partial<ButtonProps>;
  menuProps?: Partial<MenuProps>;
}

const Select: React.FunctionComponent<SelectProps> = (props) => {
  const classes = useStyles(props);
  const { closeOnSelect = false, renderValue, buttonProps, menuProps, children } = props;
  const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement>(null);

  const handleClose = () => {
    setButtonEl(null);
  };

  const handleItemClick = (child: React.ReactElement<{ onClick?: () => void }>) => () => {
    const {
      props: { onClick }
    } = child;
    if (onClick) {
      onClick();
    }
    handleClose();
  };

  return (
    <div>
      <Button
        className={classNames(classes.selectButton, { [classes.menuOpen]: Boolean(buttonEl) })}
        aria-haspopup='true'
        color='primary'
        variant='outlined'
        endIcon={<ArrowDropDown />}
        {...buttonProps}
        onClick={(e) => setButtonEl(e.currentTarget)}
      >
        <Typography align={'left'} noWrap variant='inherit' className={classes.fullWidth}>
          {renderValue()}
        </Typography>
      </Button>
      <Menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        {...menuProps}
        getContentAnchorEl={null}
        open={Boolean(buttonEl)}
        anchorEl={buttonEl}
        onClose={handleClose}
      >
        {closeOnSelect
          ? React.Children.map(children, (child: React.ReactElement<any>) =>
              React.cloneElement(child, { onClick: handleItemClick(child) })
            )
          : children}
      </Menu>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  selectButton: {
    '& .MuiButton-startIcon': {
      color: theme.palette.primary.light
    },
    '&:not(.Mui-disabled) .MuiButton-endIcon': {
      transition: theme.transitions.create(['color', 'transform'], {
        duration: theme.transitions.duration.short,
        easing: theme.transitions.easing.easeInOut
      }),
      color: theme.palette.primary.light
    },

    '&:hover': {
      '& .MuiButton-endIcon': {
        color: theme.palette.primary.main
      }
    }
  },
  menuOpen: {
    '& .MuiButton-endIcon': {
      transform: 'rotate(180deg)'
    }
  },
  fullWidth: {
    width: '100%'
  }
}));
export default Select;
