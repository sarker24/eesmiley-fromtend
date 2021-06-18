import * as React from 'react';
import { Button } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';

interface OwnProps {
  filterHandler: (filter: string) => void;
  projectTotals: Array<number>;
  filter: string;
}

type ProjectFilterProps = InjectedIntlProps & OwnProps;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexFlow: 'row wrap',
    margin: '-6px',
    '& > *': {
      margin: '6px'
    }
  }
});

const ProjectFilter: React.FunctionComponent<ProjectFilterProps> = (props) => {
  const classes = useStyles(props);
  const { intl, filterHandler, projectTotals, filter } = props;

  return (
    <div className={classes.root}>
      <Button
        variant='contained'
        className='filterButton'
        color={filter === 'NOT_STARTED' ? 'primary' : undefined}
        onClick={() => filterHandler('NOT_STARTED')}
      >{`${intl.messages['project.status.notStarted']} (${projectTotals[0]})`}</Button>
      <Button
        variant='contained'
        className='filterButton'
        color={filter === 'IN_PROGRESS' ? 'primary' : undefined}
        onClick={() => filterHandler('IN_PROGRESS')}
      >{`${intl.messages['project.status.inProgress']} (${projectTotals[1]})`}</Button>
      <Button
        variant='contained'
        className='filterButton'
        color={filter === 'DONE' ? 'primary' : undefined}
        onClick={() => filterHandler('DONE')}
      >{`${intl.messages['project.status.done']} (${projectTotals[2]})`}</Button>
    </div>
  );
};

export default injectIntl(ProjectFilter);
