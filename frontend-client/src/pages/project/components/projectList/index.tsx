import * as React from 'react';
import { Tab, Tabs, CircularProgress, Theme } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import { Project } from 'redux/ducks/projects';

export interface OwnProps {
  projectList: Project[];
  timeline: React.ReactElement;
  information: React.ReactElement;
  actionsPanel: React.ReactElement;
  hasActionsPanel?: boolean;
  isMobileView: boolean;
  handleClick: (project: Project) => void;
  filter: string;
  selectedItemId: string;
}

type ProjectListProps = InjectedIntlProps & OwnProps;

const useStyles = makeStyles((theme: Theme) => ({
  projectList: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: -theme.spacing(2),
      marginRight: -theme.spacing(2)
    }
  },
  project: {
    color: '#222222',
    cursor: 'pointer'
  },
  projectTile: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    padding: theme.spacing(2),
    '& > * + *': {
      marginLeft: theme.spacing(2)
    }
  },
  projectTileIcon: {
    transition: 'rotate 0.3s ease-in-out'
  },
  projectTileSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    '& svg': {
      transform: 'rotate(180deg)'
    }
  },
  projectName: {
    flex: '1 1 auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  tabs: {
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
    '& .MuiTab-root': {
      flex: '1 1 50%',
      maxWidth: 'initial'
    }
  },
  tabPanel: {
    padding: `${theme.spacing(2)}px`
  },
  progressWrapper: {
    position: 'relative',
    display: 'block',
    width: '60px',
    margin: 0
  },
  innerProgressCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '5px',
    top: '5px',
    fontSize: '0.8rem',
    width: '50px',
    height: '50px',
    border: '2px solid #29b6f6',
    borderRadius: '50%'
  }
}));

const ProjectList: React.FunctionComponent<ProjectListProps> = (props) => {
  const classes = useStyles(props);
  const [selectedTab, setSelectedTab] = React.useState<number>(0);

  const getProductsString = (project: Project) => {
    const { intl } = props;

    if (project.registrationPoints.length === 0) {
      return intl.messages['report.filter.no_selection'];
    }

    return project.registrationPoints.map((point) => point.name.toLowerCase()).join(', ');
  };

  const handleTabChange = (event: React.ChangeEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const createProjectElement = (originalProject: Project) => {
    const {
      intl,
      handleClick,
      selectedItemId,
      isMobileView,
      timeline,
      information,
      actionsPanel,
      hasActionsPanel
    } = props;
    const project = originalProject.activeChild ? originalProject.activeChild : originalProject;
    const isSelected = project.id === selectedItemId || project.parentProjectId === selectedItemId;
    return (
      <div
        key={project.id}
        onClick={() => {
          handleClick(project);
        }}
        className={classes.project}
      >
        <div
          className={classNames(classes.projectTile, { [classes.projectTileSelected]: isSelected })}
        >
          <div className={classes.progressWrapper}>
            <CircularProgress
              variant='determinate'
              value={project.percentage ? project.percentage : null}
              size={60}
              thickness={2}
            />
            <span className={classes.innerProgressCircle}>
              {project.percentage ? project.percentage : 0}%
            </span>
          </div>
          <div className={classes.projectName}>
            <h3>{project.name}</h3>
            <span>{getProductsString(project)}</span>
          </div>
          {isMobileView ? <ExpandMoreIcon className={classes.projectTileIcon} /> : null}
        </div>
        {isMobileView && project.id === selectedItemId && (
          <div>
            <Tabs value={selectedTab} onChange={handleTabChange} className={classes.tabs}>
              <Tab label={intl.messages['project.dialog.projectInfo']} />
              <Tab label={intl.messages['project.timeline']} />
            </Tabs>
            <div className={classes.tabPanel}>
              <div hidden={selectedTab !== 0}>{selectedTab === 0 && project && information}</div>
            </div>
            <div hidden={selectedTab !== 1}>
              {selectedTab === 1 && hasActionsPanel ? actionsPanel : timeline}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getActiveProjects = (props: ProjectListProps): Project[] => {
    const { projectList, filter } = props;

    if (!projectList) {
      return [];
    }
    if (filter === '') {
      return projectList;
    }

    return projectList.filter((project) =>
      project.name.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const activeProjects = getActiveProjects(props);

  return (
    <div className={classes.projectList}>
      {activeProjects.map((project) => createProjectElement(project))}
    </div>
  );
};

export default injectIntl(ProjectList);
