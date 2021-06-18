import * as React from 'react';
import Container from 'components/container';
import { CircularProgress, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import getOrdinal from 'utils/ordinals';
import ProjectModal from 'modalContent/projectModal';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import { Project, ProjectStatus as PStatus } from 'redux/ducks/projects';
import { Modal } from 'redux/ducks/ui';
import { RootState } from 'redux/rootReducer';
import './index.scss';

type StateProps = ReturnType<typeof mapStateToProps>;

export interface OwnProps {
  openModal: (modal: Modal) => void;
  projectsFiltered: Project[];
  setProject: (project?: Project) => void;
  clearProject: () => void;
}

type ProjectStatusProps = StateProps & InjectedIntlProps & OwnProps;

class ProjectStatus extends React.Component<ProjectStatusProps> {
  render() {
    const { setProject, clearProject, openModal, intl, projectsLoaded } = this.props;
    // Filter finished projects
    const projectsFiltered = this.props.projectsFiltered.filter(
      (project) => project.parentProjectId == null && project.status != PStatus.isFinished
    );

    if (!projectsLoaded) {
      return (
        <div className='container empty-data'>
          <LoadingPlaceholder />
        </div>
      );
    }

    return projectsFiltered.length > 0 ? (
      <Container
        title={intl.messages['project.projects_status']}
        className='projectStatus has-projects btmSpacing'
      >
        <div className='projectContainer'>
          {projectsFiltered.map((project: Project, index: number) => (
            <Button
              fullWidth
              className='project'
              key={`project_${index}_${project.id}`}
              onClick={() => {
                setProject(project);
                openModal({ content: <ProjectModal />, title: 'projectModal' });
              }}
            >
              <div className='projectStatusHead'>
                <p className='projectStatusTitle'>{`${project.name}`}</p>
                <span className='projectStatusPeriod'>
                  {`${getOrdinal(project.period)} ${intl.messages['project.timeline.period']}`}
                </span>
              </div>
              <div className='projectStatusFooter'>
                <div className='projectStatusIcon'>
                  <div className='projectProgress'>
                    <span className='projectPercentage'>
                      {project.percentage ? project.percentage : 0}%
                    </span>
                    <CircularProgress
                      className='projectPercentageProgress'
                      variant='determinate'
                      value={project.percentage ? project.percentage : null}
                      size={50}
                      thickness={2}
                    />
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        <div className='componentFooter'>
          <Button
            variant='contained'
            color='primary'
            key='see-more-button'
            startIcon={<AddIcon />}
            onClick={() => {
              browserHistory.push('/project');
            }}
          >
            {intl.messages['sales.dialog.seeMore']}
          </Button>
        </div>
      </Container>
    ) : (
      <div className='projectStatus container empty-data'>
        <div className='clearfix newProjectBtnContainer'>
          <Button
            key='new-project-button'
            startIcon={<AddIcon />}
            onClick={() => {
              clearProject();
              browserHistory.push('/project');
            }}
          />
        </div>
        <span>{intl.messages['dashboard.noProjectsTitle']}</span>
        <div>{intl.formatMessage({ id: 'project.dialog.redirect' }, { object: '+' })}</div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  projectsLoaded: state.projects.projectsLoaded
});

export default connect<StateProps, unknown, OwnProps>(mapStateToProps)(injectIntl(ProjectStatus));
