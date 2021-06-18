import * as React from 'react';
import moment from 'moment';
import { CircularProgress, IconButton, TextField, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import ProjectDuration from '../projectActionsPanel/components/projectDuration';
import { onSubmitForm } from 'utils/helpers';
import { connect } from 'react-redux';
import * as projectDispatch from 'redux/ducks/projects';
import DeleteIcon from '@material-ui/icons/Delete';
import { canAddActionsToProject } from 'utils/projectUtils';
import isEqual from 'lodash/isEqual';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import ProjectRegistrationPoints from '../projectRegistrationPoints';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Project, ProjectsActions, ProjetRegistrationPoint } from 'redux/ducks/projects';
import './index.scss';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface OwnProps {
  isMobileView: boolean;
  registrationPoints: RegistrationPoint[];
  updateProject: (args: {
    project: Project;
    patch;
    reloadTimeline?: boolean;
    updateParent?: boolean;
  }) => void;
}

export interface IComponentState {
  project: Project;
  newAction: { name: string };
}

type ProjectInformationProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class ProjectInformation extends React.Component<ProjectInformationProps, IComponentState> {
  formRef: React.RefObject<HTMLFormElement>;

  constructor(props: ProjectInformationProps) {
    super(props);

    this.formRef = React.createRef();

    this.state = {
      project: this.props.project,
      newAction: { name: '' }
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: ProjectInformationProps) {
    const { project } = nextProps;

    if (project) {
      if (
        !this.state.project ||
        this.state.project.id != project.id ||
        !isEqual(this.state.project.actions, project.actions)
      ) {
        this.setState({
          project
        });
      }
    }
  }

  getDuration = () => {
    const { intl, minDate, editMode } = this.props;
    const project = Object.assign({}, this.state.project);

    if (editMode) {
      return (
        <div>
          <dt>
            {project.duration.type === 'REGISTRATIONS'
              ? intl.messages['project.dialog.info.durationByReg']
              : intl.messages['project.dialog.info.durationByDate']}
          </dt>
          <dd>
            <div className='projectDuration' onBlur={this.saveHandler}>
              <ProjectDuration
                minDate={minDate}
                duration={project.duration}
                isDurationTypeDisabled={!!project.parentProjectId}
                handleChange={(value) => {
                  if (
                    value.start &&
                    value.end &&
                    moment.unix(value.end).diff(moment.unix(value.start), 'days') < 1
                  ) {
                    value.end = moment.unix(value.start).endOf('day').unix();
                  }
                  this.setState(
                    { project: Object.assign({}, project, { duration: value }) },
                    () => {
                      this.saveHandler();
                    }
                  );
                }}
              />
            </div>
          </dd>
        </div>
      );
    }

    return (
      <div>
        <dt>
          {project.duration.type === 'REGISTRATIONS'
            ? intl.messages['project.dialog.info.durationByReg']
            : intl.messages['project.dialog.info.durationByDate']}
        </dt>
        <dd>
          {project.duration.type === 'REGISTRATIONS'
            ? `${project.duration.days || 0}d`
            : `${moment(moment.unix(project.duration.start)).format('L')} - ${moment(
                moment.unix(project.duration.end)
              ).format('L')}`}
        </dd>
      </div>
    );
  };

  getActions = () => {
    const { intl, editMode } = this.props;
    const { project, newAction } = this.state;

    const getContent = (project: Project) => {
      if (editMode && canAddActionsToProject(project)) {
        const actionElements = [];

        for (let i = 0; i < project.actions.length; i++) {
          actionElements.push(
            <div key={`action_${i}`}>
              <TextField
                type='text'
                name={`action-${i}`}
                key={`action-${i}`}
                onBlur={this.saveHandler}
                required={true}
                value={project.actions[i].name}
                onChange={(event) => {
                  const name = event.target.value;
                  const actions = this.state.project.actions.map((a, index) =>
                    index === i ? { ...a, name } : a
                  );
                  const project = { ...this.state.project, actions };
                  this.setState({ project });
                }}
              />
              <IconButton
                className='removeBtn'
                onClick={() => {
                  const actions = [...project.actions];

                  this.setState(
                    {
                      project: Object.assign({}, project, {
                        actions: actions.filter((action) => action !== actions[i])
                      })
                    },
                    () => this.saveHandler()
                  );
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          );
        }

        actionElements.push(
          <div key={`action_new`}>
            <TextField
              type='text'
              name={'action-new'}
              key={'action-new'}
              onBlur={this.saveHandler}
              value={newAction.name}
              onChange={(event) => {
                newAction.name = event.target.value;
                this.setState({ newAction });
              }}
            />
          </div>
        );

        return (
          <div>
            <br />
            <div className='projectActions'>
              <dt>{intl.messages['project.dialog.info.actionsImplemented']}</dt>
              <dd>{actionElements}</dd>
            </div>
          </div>
        );
      }

      return project.actions && project.actions.length > 0 ? (
        <div>
          <div>
            <dt>{intl.messages['project.dialog.info.actionsImplemented']}</dt>
            <dd>
              <ul className={'itemsList'}>
                {project.actions && project.actions.length > 0
                  ? project.actions.map((action: { name: string }, index: number) => {
                      return <li key={`action_${index}`}>{action.name}</li>;
                    })
                  : null}
              </ul>
            </dd>
          </div>
        </div>
      ) : null;
    };
    return getContent(project);
  };

  handleToggleEdit = () => {
    const { editMode, setEditMode } = this.props;
    setEditMode(!editMode);
  };

  getPatchObject = () => {
    const { project: newProject } = this.state;
    const { project: oldProject } = this.props;

    const patchPaths: (keyof Project)[] = newProject.parentProjectId
      ? ['duration', 'status', 'actions']
      : ['name', 'registrationPoints', 'duration', 'status', 'actions'];

    return patchPaths.reduce((ops, key) => {
      if (!isEqual(oldProject[key], newProject[key])) {
        const value =
          key === 'registrationPoints'
            ? this.deleteUnnecessaryRegPointData(newProject[key])
            : newProject[key];
        ops.push({ op: 'replace', path: `/${key}`, value });
      }
      return ops;
    }, [] as { op: string; path: string; value: NestedPartial<Project[keyof Project]> }[]);
  };

  deleteUnnecessaryRegPointData = (
    registrationPoints: ProjetRegistrationPoint[]
  ): { id: number }[] => {
    return registrationPoints.map((registrationPoint) => ({
      id: parseInt(registrationPoint.id as string, 10)
    }));
  };

  saveHandler = () => {
    const project = Object.assign({}, this.state.project);

    project.actions = project.actions.filter((action: { name: string }) => {
      return action.name != '' && action.name != null;
    });

    if (
      this.state.newAction &&
      this.state.newAction.name &&
      this.state.newAction.name != '' &&
      this.state.newAction.name != null
    ) {
      project.actions.push({ name: this.state.newAction.name });
      this.setState({
        newAction: {
          name: ''
        }
      });
    }

    this.setState({ project }, () => {
      const editForm = this.formRef.current;

      if (project && (!editForm || !editForm.checkValidity || editForm.checkValidity())) {
        const { updateProject } = this.props;

        const save = () => {
          updateProject({
            project,
            patch: this.getPatchObject(),
            reloadTimeline: true
          });
          this.props.setProject(project);
        };

        save();
      }
    });
  };

  onSelectionChange = (registrationPoints: Array<RegistrationPoint>) => {
    this.setState(
      (prevState) => ({ project: { ...prevState.project, registrationPoints } }),
      this.saveHandler
    );
  };

  render() {
    const { intl, isMobileView, registrationPoints, editMode } = this.props;
    const { project } = this.state;

    return (
      project && (
        <div className='projectInformation'>
          <div className='projectProgress'>
            <p className='projectPercentage'>
              {project.activeChild ? project.activeChild.percentage : project.percentage}%
            </p>
            <CircularProgress
              variant='determinate'
              value={project.activeChild ? project.activeChild.percentage : project.percentage}
              size={120}
              thickness={3}
            />
          </div>
          <form ref={this.formRef} onSubmit={onSubmitForm(this.saveHandler)}>
            <div className={'projectInformationEditor'}>
              <div className='projectInformationTitle'>
                <Typography variant='h6' component='h3'>
                  {intl.messages['project.dialog.projectInfo']}
                </Typography>
                {!isMobileView && (
                  <IconButton
                    className={'projectEditButton ' + (editMode && 'active')}
                    title={intl.messages['edit']}
                    onClick={this.handleToggleEdit}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </div>
              <dl>
                <dt>{intl.messages['name']}</dt>
                <dd>
                  {!editMode ? (
                    project.name
                  ) : (
                    <TextField
                      type='text'
                      disabled={!!project.parentProjectId}
                      onBlur={this.saveHandler}
                      required={true}
                      name='panel1_nameInput'
                      value={project.name}
                      onChange={(event) => {
                        event.preventDefault();
                        const name = event.target.value;
                        this.setState((prevState) => ({ project: { ...prevState.project, name } }));
                      }}
                    />
                  )}
                </dd>
              </dl>
              <dl className='projectFieldsRequirePendingStart'>
                <dt>{intl.messages['registrationPoints']}</dt>
                <dd>
                  <ProjectRegistrationPoints
                    key={`${project.id}`}
                    registrationPoints={registrationPoints}
                    projectRegistrationPoints={project.registrationPoints}
                    onSelectionChange={this.onSelectionChange}
                    inReadMode={!editMode || (editMode && !!project.parentProjectId)}
                  />
                </dd>
              </dl>
              <dl className='projectFieldsRequirePendingStart'>{this.getDuration()}</dl>
              <dl className='projectFieldsRequirePendingStart'>{this.getActions()}</dl>
            </div>
          </form>
        </div>
      )
    );
  }
}

const mapStateToProps = ({ projects }: RootState) => ({
  editMode: projects.editMode,
  minDate: projects.minDate,
  project:
    projects.project &&
    (projects.project.activeChild ? projects.project.activeChild : projects.project)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<unknown, unknown, ProjectsActions>) => ({
  setEditMode: (editMode: boolean) => dispatch(projectDispatch.setEditMode(editMode)),
  setProject: (project: Project) => dispatch(projectDispatch.setProject(project))
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ProjectInformation));
