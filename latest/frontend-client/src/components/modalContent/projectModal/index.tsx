import { getProjectState } from 'project/selectors';
import { browserHistory } from 'react-router';
import './index.scss';

import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import ProjectStatus from './components/projectStatus';
import ProjectTimeline from 'pages/project/components/projectTimeline';
import * as projectsDispatch from 'redux/ducks/projects';
import * as uiDispatch from 'redux/ducks/ui';
import { connect } from 'react-redux';
import { getActiveRegistrationPointsDepthFirst } from 'redux/ducks/data/registrationPoints/selectors';
import * as registrationPointsDispatch from 'redux/ducks/data/registrationPoints';
import { Project, ProjectsActions } from 'redux/ducks/projects';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { UiActions } from 'redux/ducks/ui';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type ProjectModalProps = StateProps & DispatchProps & InjectedIntlProps;

export class ProjectModal extends React.Component<ProjectModalProps> {
  public static defaultProps = {
    project: null
  };

  componentDidMount() {
    const { project, getProjectTimeline, getRegistrationPoints } = this.props;

    void getRegistrationPoints();
    if (project && project.id) {
      void getProjectTimeline((project.parentProjectId as number) || (project.id as number));
    }
  }

  handleEditProject = () => {
    const { project } = this.props;
    browserHistory.push(`/project?preselected=${project.id}`);
  };

  render() {
    const { project, registrationPoints, hideModal, massUnit } = this.props;

    return (
      <div className='projectModalContent'>
        <div className='projectModalContentBody'>
          <ProjectStatus
            closeModal={hideModal}
            project={project}
            registrationPoints={registrationPoints}
          />
          <ProjectTimeline
            project={project}
            hideModal={hideModal}
            massUnit={massUnit}
            editProjectAndAddAction={this.handleEditProject}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  project: getProjectState(state),
  registrationPoints: getActiveRegistrationPointsDepthFirst(state),
  massUnit: state.settings.unit
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<unknown, unknown, ProjectsActions | UiActions>
) => ({
  setProject: (project: Project) => dispatch(projectsDispatch.setProject(project)),
  hideModal: () => dispatch(uiDispatch.hideModal()),
  getProjectTimeline: (id: number) => dispatch(projectsDispatch.getProjectTimeline(id)),
  getRegistrationPoints: () => dispatch(registrationPointsDispatch.findTree())
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ProjectModal));
