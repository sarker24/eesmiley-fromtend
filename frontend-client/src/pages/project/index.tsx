import * as React from 'react';
import Helmet from 'react-helmet';
import CreateProject from './components/createProject';
import ProjectList from './components/projectList';
import ProjectInformation from './components/projectInformation';
import ProjectTimeline from './components/projectTimeline';
import ProjectFilter from './components/projectFilter';
import ProjectActionsPanel from './components/projectActionsPanel';
import SearchIcon from '@material-ui/icons/Search';
import AddAction from '@material-ui/icons/Add';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import { withStyles } from '@material-ui/core/styles';
import { Fab, Grid, InputAdornment, TextField } from '@material-ui/core';
import ScrollArea from 'react-scrollbar';
import moment from 'moment';
import { connect } from 'react-redux';
import * as uiDispatch from '../../redux/ducks/ui';
import * as projectsDispatch from 'redux/ducks/projects';
import { Project, ProjectsActions, ProjectStatus } from 'redux/ducks/projects';
import * as notificationDispatch from 'redux/ducks/notification';
import { NotificationActions } from 'redux/ducks/notification';
import * as registrationPointsDispatch from 'redux/ducks/data/registrationPoints';
import { getFilterByProjectStatus, projectGetStatus } from 'utils/projectUtils';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import isEqual from 'lodash/isEqual';
import { getProjectsState, getProjectState } from './selectors';
import { getActiveRegistrationPointsDepthFirst } from 'redux/ducks/data/registrationPoints/selectors';
import { RootState } from 'redux/rootReducer';
import { getSettings } from 'redux/ducks/settings';
import { ThunkDispatch } from 'redux-thunk';
import { UiActions } from 'redux/ducks/ui';

// eslint-disable-next-line
const styles = require('./index.scss');

const projectFilters = {
  notStarted: [ProjectStatus.isPendingStart],
  inProgress: [
    ProjectStatus.isRunning,
    ProjectStatus.isPendingInput,
    ProjectStatus.isPendingFollowUp,
    ProjectStatus.isRunningFollowUp
  ],
  done: [ProjectStatus.isFinished, ProjectStatus.isOnHold]
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface OwnProps {
  currency: string;
}

export interface IComponentState {
  hasActionsPanel: boolean;
  projectList: Project[];
  projectFilter: string;
  selectedItemId: string | number;
  parentProjects: Project[];
}

type ProjectPageProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class ProjectPage extends React.Component<ProjectPageProps, IComponentState> {
  async;
  private searchFilter: string;
  private hasLoadedProjects: boolean;

  constructor(props: ProjectPageProps) {
    super(props);
    this.state = {
      hasActionsPanel: false,
      projectList: [],
      projectFilter: '',
      selectedItemId: null,
      parentProjects: []
    };
    this.searchFilter = '';
  }

  static getDerivedStateFromProps(nextProps: ProjectPageProps, prevState: IComponentState) {
    if (nextProps.project) {
      // this.state.projectList is created based on the project prop.
      // If the data in the project prop has changed, replace that project's data in our projectList and update the state
      const projectList = prevState.projectList.map((project) => {
        return project.id === nextProps.project.id && !isEqual(project, nextProps.project)
          ? nextProps.project
          : project;
      });

      return projectList ? { projectList: projectList } : null;
    }
    return null;
  }

  filterProjectsByStatus = (status: ProjectStatus[]) => {
    const { projects } = this.props;
    return projects.filter((project) => {
      if (project.parentProjectId !== null) {
        return false;
      }

      return status.includes(projectGetStatus(project));
    });
  };

  getProjectCount = () => {
    const pendingStart = this.filterProjectsByStatus(projectFilters.notStarted).length;
    const inProgress = this.filterProjectsByStatus(projectFilters.inProgress).length;
    const done = this.filterProjectsByStatus(projectFilters.done).length;

    return [pendingStart, inProgress, done];
  };

  initializeFilter = () => {
    const projectCount = this.getProjectCount();
    let filter = 'IN_PROGRESS';

    if (projectCount[1] > 0) {
      // Do nothing
    } else if (projectCount[0] > 0) {
      filter = 'NOT_STARTED';
    } else if (projectCount[2] > 0) {
      filter = 'DONE';
    }

    this.setFilter(filter);
  };

  setFilter = (projectFilter: string) => {
    let projectList: Project[] = [];

    switch (projectFilter) {
      case 'NOT_STARTED': {
        projectList = this.filterProjectsByStatus(projectFilters.notStarted);
        break;
      }
      case 'IN_PROGRESS': {
        projectList = this.filterProjectsByStatus(projectFilters.inProgress);
        break;
      }
      case 'DONE': {
        projectList = this.filterProjectsByStatus(projectFilters.done);
        break;
      }
    }

    this.setState(
      {
        projectList: projectList,
        projectFilter: projectFilter
      },
      () => {
        this.props.setEditMode(false);

        if (projectList.length) {
          void this.handleProject(projectList[0]);
        }
      }
    );
  };

  isMobileView = () => {
    return window.innerWidth < 961;
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleProject = async (project: Project) => {
    const { setProject, registrationPoints, getProjectTimeline } = this.props;

    project.registrationPoints =
      project &&
      registrationPoints.filter((registrationPoint) => {
        return project.registrationPoints.some((projectProduct) => {
          return projectProduct.id.toString() === registrationPoint.id.toString();
        });
      });

    this.setState({ selectedItemId: project.id });
    await getProjectTimeline(project.parentProjectId ? project.parentProjectId : project.id);
    setProject(project);

    return project;
  };

  toggleActionsPanel = (mode?: string) => {
    if (mode == 'cancel') {
      this.setState({ hasActionsPanel: false });
      const project = Object.assign({}, this.props.project);

      project.actions = project.actions.filter((action) => {
        return action.name != '';
      });

      this.props.setProject(project);
    } else {
      this.setState((prevState) => ({ hasActionsPanel: !prevState.hasActionsPanel }));
    }
  };

  editProjectAndAddAction = () => {
    const project = Object.assign({}, this.props.project);
    const actions = [...project.actions, { name: '' }];

    this.props.setProject(Object.assign({}, project, { actions }));
    this.setState({ hasActionsPanel: true });
  };

  updateProject = async (args: {
    project: Project;
    patch: { op: string; path: string; value: any }[];
    reloadTimeline?: boolean;
    updateParent?: boolean;
  }) => {
    const { updateProject, getProjectTimeline } = this.props;
    const {
      project: { id, parentProjectId },
      patch,
      reloadTimeline,
      updateParent
    } = args;

    await updateProject(id as string, patch);

    if (updateParent && parentProjectId) {
      await updateProject(parentProjectId as string, patch);
    }

    if (reloadTimeline) {
      await getProjectTimeline(parentProjectId ? parentProjectId : id);
    }
  };

  createNewProject = (project: Project) => {
    const newProject: Partial<Project> = {
      parentProjectId: project.parentProjectId ? project.parentProjectId : project.id,
      name: project.name,
      registrationPoints: project.registrationPoints,
      actions: project.actions,
      duration: {
        start: null,
        type: project.duration.type
      }
    };
    const today = moment().startOf('day').unix();
    if (project.duration.type === 'REGISTRATIONS') {
      newProject.duration['start'] = today;
      newProject.duration['days'] = project.duration.days;
    } else {
      const endDate = today + (project.duration.end - project.duration.start);
      newProject.duration['start'] = today;
      newProject.duration['end'] = moment.unix(endDate).endOf('day').unix();
    }

    return this.onCreateProject(newProject as Project);
  };

  updateFilter = (filterValue: string) => {
    this.searchFilter = filterValue;
    this.forceUpdate();
  };

  updateProjectsState = () => {
    const { getProjects, getRegistrationPoints } = this.props;

    // Wait until projects, areas, products and registrations has been loaded - then set the "hasLoadedProjects" property to true
    return Promise.all([getProjects(), getRegistrationPoints()])
      .then(() => {
        this.hasLoadedProjects = true;
      })
      .catch(() => {
        this.hasLoadedProjects = true;
      });
  };

  handleClickProject = (selectedProject: Project) => {
    this.props.setEditMode(false);
    return this.handleProject(selectedProject);
  };

  renderProjects = () => {
    const { intl, registrationPoints, project, massUnit } = this.props;
    const { hasActionsPanel, selectedItemId, projectFilter, projectList } = this.state;
    const editableProject = project ? (project.activeChild ? project.activeChild : project) : null;
    const searchFilter = this.searchFilter;
    const projectTotals = this.getProjectCount();
    const isMobileView = this.isMobileView();

    return (
      <Grid className='projectPageGrid' container spacing={3}>
        <Grid className='gridElement' item xs={12} md={4}>
          <ScrollArea speed={0.8} vertical={true} smoothScrolling={true} className='scrollArea'>
            <ProjectFilter
              filter={projectFilter}
              filterHandler={this.setFilter}
              projectTotals={projectTotals}
            />
            <div style={{ marginBottom: '24px', marginTop: '24px' }}>
              <TextField
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon color='primary' />
                    </InputAdornment>
                  ),
                  placeholder: intl.messages['search']
                }}
                onChange={(event) => {
                  this.updateFilter(event.target.value);
                }}
              />
            </div>
            <ProjectList
              filter={searchFilter}
              handleClick={this.handleClickProject}
              selectedItemId={selectedItemId as string}
              hasActionsPanel={hasActionsPanel}
              timeline={
                <ProjectTimeline
                  project={editableProject}
                  setFilter={this.setFilter}
                  createNewProject={this.createNewProject}
                  updateProject={this.updateProject}
                  editProjectAndAddAction={this.editProjectAndAddAction}
                  massUnit={massUnit}
                />
              }
              information={
                <ProjectInformation
                  isMobileView={isMobileView}
                  updateProject={this.updateProject}
                  registrationPoints={registrationPoints}
                />
              }
              actionsPanel={
                <ProjectActionsPanel
                  project={editableProject}
                  toggleActionsPanel={this.toggleActionsPanel}
                  updateProject={this.updateProject}
                />
              }
              isMobileView={isMobileView}
              projectList={projectList}
            />
          </ScrollArea>
        </Grid>
        {!isMobileView ? (
          <Grid className='gridElement' item md={4}>
            <ScrollArea speed={0.8} vertical={true} smoothScrolling={true} className='scrollArea'>
              {project && (
                <ProjectInformation
                  isMobileView={false}
                  updateProject={this.updateProject}
                  registrationPoints={registrationPoints}
                />
              )}
            </ScrollArea>
          </Grid>
        ) : null}
        {!isMobileView ? (
          <Grid className='gridElement' item md={4}>
            <ScrollArea speed={0.8} vertical={true} smoothScrolling={true} className='scrollArea'>
              {hasActionsPanel ? (
                <ProjectActionsPanel
                  toggleActionsPanel={this.toggleActionsPanel}
                  project={editableProject}
                  updateProject={this.updateProject}
                />
              ) : (
                <ProjectTimeline
                  setFilter={this.setFilter}
                  createNewProject={this.createNewProject}
                  updateProject={this.updateProject}
                  project={project}
                  massUnit={massUnit}
                  editProjectAndAddAction={this.editProjectAndAddAction}
                />
              )}
            </ScrollArea>
          </Grid>
        ) : null}
      </Grid>
    );
  };

  renderPlaceholder = () => {
    const { intl } = this.props;
    return (
      <div className='placeHolder'>
        <h1>{intl.messages['dashboard.noProjectsTitle']}</h1>
        <h2>{intl.formatMessage({ id: 'project.dialog.createNew' }, { object: '+' })}</h2>
      </div>
    );
  };

  onCreateProject = (project: Partial<Project>): Promise<Project> => {
    const { createProject, getProjects } = this.props;
    return createProject(project).then((data: unknown) => {
      const payload = (data as { payload: Project }).payload;
      const id = payload.parentProjectId ? payload.parentProjectId : payload.id;
      void this.updateProjectsState().then(() => {
        this.setFilter(getFilterByProjectStatus(payload.status));
        void getProjects().then((data: unknown) => {
          const payload = (data as { payload: Project[] }).payload;
          for (const item of payload) {
            if (item.id == id) {
              void this.handleProject(item);
              break;
            }
          }
        });
      });
      return payload;
    });
  };

  handleResize = () => {
    this.forceUpdate();
  };

  updateToPreselected = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('preselected') ? Number(urlParams.get('preselected')) : null;

    if (id != null) {
      const preselectedProject = this.props.projects.filter((itm) => {
        return id == itm.id;
      });

      if (preselectedProject[0] != undefined) {
        await this.handleProject(preselectedProject[0]);
        this.props.setEditMode(true);
        return preselectedProject[0];
      }
    }

    if (!this.state.selectedItemId && this.state.projectList.length > 0) {
      await this.handleProject(this.state.projectList[0]);
      return this.state.projectList[0];
    }
  };

  async componentDidMount() {
    await this.updateProjectsState();
    this.initializeFilter();
    await this.updateToPreselected();
    window.addEventListener('resize', this.handleResize);
  }

  render() {
    const {
      intl,
      showNotification,
      openModal,
      closeModal,
      projects,
      registrationPoints
    } = this.props;

    return (
      <div className='projectPageContainer'>
        <Helmet title={intl.messages['projects']} />

        {!this.hasLoadedProjects ? (
          <LoadingPlaceholder />
        ) : projects.length > 0 ? (
          this.renderProjects()
        ) : (
          this.renderPlaceholder()
        )}

        <Fab
          className='createProject'
          color='primary'
          onClick={() => {
            openModal(
              <CreateProject
                showNotification={showNotification}
                update={this.updateProjectsState}
                closeModal={closeModal}
                createProject={this.onCreateProject}
                registrationPoints={registrationPoints}
              />,
              'createProjectModal',
              intl.messages['project.dialog.create']
            );
          }}
        >
          <AddAction />
        </Fab>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  projects: getProjectsState(state),
  project: getProjectState(state),
  registrationPoints: getActiveRegistrationPointsDepthFirst(state),
  massUnit: getSettings(state).unit
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, ProjectsActions | UiActions | NotificationActions>
) => ({
  closeModal: () => dispatch(uiDispatch.hideModal()),
  showNotification: (message: string, isError: boolean) =>
    dispatch(notificationDispatch.showNotification(message, isError)),
  openModal: (content: React.ReactNode, className?: string, title?: string) =>
    dispatch(
      uiDispatch.showModal({
        content,
        className,
        title
      })
    ),
  getProjects: () => dispatch(projectsDispatch.getProjects()),
  setEditMode: (editMode: boolean) => dispatch(projectsDispatch.setEditMode(editMode)),
  updateProject: (id: any, patch: { op: string; path: string; value: any }[]) =>
    dispatch(projectsDispatch.updateProject(id, patch)),
  createProject: (data: Partial<Project>) => dispatch(projectsDispatch.createProject(data)),
  getRegistrationPoints: () => dispatch(registrationPointsDispatch.findTree()),
  setProject: (projectData: Project | null) => dispatch(projectsDispatch.setProject(projectData)),
  getProjectTimeline: (id) => dispatch(projectsDispatch.getProjectTimeline(id))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(injectIntl(ProjectPage)));
