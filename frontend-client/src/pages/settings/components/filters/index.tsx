import * as React from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

export interface SettingsFilter {
  label: string;
  active: boolean;
  component: React.ReactElement;
  id: string;
}

export interface FiltersProps {
  filters: SettingsFilter[];
  changeFilter: (filter: { label: string; active: boolean }) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column wrap',
    [theme.breakpoints.up('lg')]: {
      marginRight: theme.spacing(2),
      '& > * + *': {
        marginTop: theme.spacing(3)
      }
    },
    [theme.breakpoints.down('md')]: {
      flexFlow: 'row wrap',
      justifyContent: 'center',
      margin: `-${theme.spacing(1)}px -${theme.spacing(1)}px ${theme.spacing(8)}px`,
      '& > * ': {
        margin: theme.spacing(1),
        flex: '1 1 auto'
      }
    }
  },
  inactiveButton: {
    backgroundColor: theme.palette.common.white
  }
}));

const Filters: React.FunctionComponent<FiltersProps> = (props) => {
  const classes = useStyles(props);
  const { filters, changeFilter } = props;
  return (
    <div className={classes.root}>
      {filters.map((filter) => {
        return (
          <Button
            variant='contained'
            color={filter.active ? 'primary' : undefined}
            className={classNames({ [classes.inactiveButton]: !filter.active })}
            key={`${filter.label}_${filter.id}`}
            onClick={() => changeFilter(filter)}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};

export default Filters;
