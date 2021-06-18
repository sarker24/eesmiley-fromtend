import * as React from 'react';
import { createStyles, Tab, Tabs, withStyles } from '@material-ui/core';
import { TabProps } from '@material-ui/core/Tab';
import { Theme } from '@material-ui/core/styles';

// TODO: extract out reusable tabs component, this is couple with specific layout
export const StyledTabs = withStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 2),
    borderBottom: '1px solid ' + theme.palette.grey.A100,
    margin: theme.spacing(0, -2, 4)
  },
  indicator: {
    backgroundColor: theme.palette.primary.main
  }
}))(Tabs);

export const StyledTab = withStyles(
  createStyles((theme: Theme) => ({
    root: {
      textTransform: 'none',
      minWidth: 72,
      marginRight: 30,
      paddingLeft: 0,
      paddingRight: 0,

      '&:hover': {
        color: theme.palette.primary.main,
        opacity: 1
      },

      '&$selected': {
        color: theme.palette.primary.main
      },

      '&:focus': {
        color: theme.palette.primary.main
      }
    },
    labelIcon: {
      minHeight: 48,

      '& $wrapper > *:first-child': {
        marginBottom: 0
      }
    },

    wrapper: {
      flexDirection: 'row',
      fontSize: theme.typography.pxToRem(theme.typography.fontSize),

      '& svg': {
        height: '1.2rem',
        width: '1.2rem',
        marginRight: 7,
        opacity: 0.4
      }
    },
    selected: {}
  }))
)((props: TabProps) => <Tab disableRipple {...props} />);
