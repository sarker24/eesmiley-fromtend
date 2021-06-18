import * as React from 'react';
import getOrdinal from 'utils/ordinals';
import moment from 'moment';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import { browserHistory } from 'react-router';
import { formatWeight, formatMoney } from 'utils/number-format';
import { Step, StepContent, StepLabel, Stepper, Button } from '@material-ui/core';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Project, ProjectStatus } from 'redux/ducks/projects';
import './index.scss';
import { RootState } from 'redux/rootReducer';
import { Unit } from 'redux/ducks/settings';

type StateProps = ReturnType<typeof mapStateToProps>;

interface OwnProps {
  project: Project;
  massUnit: Unit;
  hideModal?: () => void;
  updateProject?: (args: {
    project: Project;
    patch;
    reloadTimeline?: boolean;
    updateParent?: boolean;
  }) => void;
  editProjectAndAddAction?: () => void;
  setFilter?: (filter: string) => void;
  createNewProject?: (project: Project) => void;
}

type ProjectTimelineProps = StateProps & InjectedIntlProps & OwnProps;

class ProjectTimeline extends React.Component<ProjectTimelineProps> {
  getStaticButton(timeline: any[]) {
    const {
      project,
      hideModal,
      editProjectAndAddAction,
      intl,
      setFilter,
      createNewProject,
      updateProject
    } = this.props;

    const status = project.activeChild ? project.activeChild.status : project.status;

    if (!hideModal) {
      switch (status) {
        case ProjectStatus.isPendingInput:
          timeline.push(
            <Step key={'timeline-step-add-action'} active={true}>
              <StepLabel icon={<div className='timelineIcon' />} />
              <StepContent>
                <div className='timelineActionButtonSet'>
                  <Button
                    variant='contained'
                    color='primary'
                    className='timelineActionButton'
                    startIcon={<AddIcon />}
                    onClick={editProjectAndAddAction}
                  >
                    {intl.messages['project.dialog.actionBtn']}
                  </Button>
                  {project.followUpProjects.length >= 1 && (
                    <Button
                      variant='contained'
                      color='primary'
                      className='timelineActionButton'
                      startIcon={<DoneIcon />}
                      onClick={() => {
                        updateProject({
                          project,
                          patch: {
                            op: 'replace',
                            path: '/status',
                            value: 'FINISHED'
                          },
                          updateParent: true
                        });
                        setFilter('DONE');
                      }}
                    >
                      {intl.messages['project.dialog.finishProject']}
                    </Button>
                  )}
                </div>
              </StepContent>
            </Step>
          );
          return;
        case ProjectStatus.isPendingFollowUp:
        case ProjectStatus.isFinished:
        case ProjectStatus.isOnHold:
          timeline.push(
            <Step key={'timeline-step-start-follow-up'} active={true}>
              <StepLabel icon={<div className='timelineIcon' />} />
              <StepContent>
                <h3 className='timelineStepTitle last'>
                  {project.period
                    ? getOrdinal(project.period + 1) +
                      ' ' +
                      intl.messages['project.timeline.projectPeriod'].toLowerCase()
                    : ''}
                </h3>
                <Button
                  variant='contained'
                  color='primary'
                  className='timelineActionButton timelineActionStartFollowUp'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (hideModal != null) {
                      hideModal();
                    }
                    createNewProject(project.activeChild ? project.activeChild : project);
                  }}
                >
                  {intl.messages['project.dialog.startFollowUp']}
                </Button>
              </StepContent>
            </Step>
          );
          return;
      }
    }
    if (status == ProjectStatus.isPendingStart || hideModal == null) {
      timeline.push(
        <Step key={'timeline-step-add-foodwaste-registration'} active={true}>
          <StepLabel icon={<div className='timelineIcon' />} />
          <StepContent>
            <Button
              variant='contained'
              color='primary'
              className='timelineActionButton'
              startIcon={<AddIcon />}
              onClick={() => {
                if (hideModal != null) {
                  hideModal();
                }
                browserHistory.push('/registration');
              }}
            >
              {intl.messages['project.timeline.foodWasteRegistration']}
            </Button>
          </StepContent>
        </Step>
      );
    }
  }

  renderTimeline(): JSX.Element[] {
    const timelineTopElements: JSX.Element[] = [];
    const timeLineElements: { date: number; timeLineContent: JSX.Element }[] = [];
    const { intl, timeline } = this.props;
    const periodString = intl.messages['project.timeline.period'].toLowerCase();

    /*
     * adding the static button, we push to timeline because we don't want to order this
     */
    this.getStaticButton(timelineTopElements);

    for (let i = 0; i < timeline.length; i++) {
      const step = timeline[i];
      const date = moment(step.createdAt);
      let timeLineStepContent = null;
      let timeLineStepTitle = null;
      switch (step.type) {
        case 'project':
          timeLineStepTitle = intl.messages['project.timeline.projectRegistration'];
          timeLineStepContent = (
            <div>
              {step.data.name} - {`${getOrdinal(step.period)}`} {periodString}
            </div>
          );
          break;
        case 'period':
          timeLineStepTitle = getOrdinal(step.period) + ' ' + periodString;
          timeLineStepContent = <div />;
          break;
        case 'action':
          timeLineStepTitle = intl.messages['project.dialog.info.actionsImplemented'];
          timeLineStepContent = (
            <div>
              {step.data.name} - {`${getOrdinal(step.period)}`} {periodString}
            </div>
          );
          break;
        case 'registration':
          timeLineStepTitle = intl.messages['project.timeline.foodWasteRegistration'];
          timeLineStepContent = (
            <div>
              {formatWeight(step.data.amount, null, step.data.unit)} -{' '}
              {formatMoney(step.data.cost).toString()}
            </div>
          );
          break;
      }

      const timeLineStepElement = (
        <Step key={`timeline-step-${i}`} active={true}>
          <StepLabel icon={<div className='timelineIcon' />}>
            <span className='timelineDate'>{date.format('DD MMM')}</span>
          </StepLabel>
          <StepContent>
            <h3 className='timelineStepTitle'>{timeLineStepTitle}</h3>
            <div className='timelineContentInner'>{timeLineStepContent}</div>
          </StepContent>
        </Step>
      );

      timeLineElements.push({
        date: date.unix(),
        timeLineContent: timeLineStepElement
      });
    }

    for (const timeLineElement of timeLineElements) {
      timelineTopElements.push(timeLineElement.timeLineContent);
    }

    return timelineTopElements;
  }

  render() {
    const { project, timeline } = this.props;
    return project && timeline ? (
      <div className='timeline'>
        <h3 className='timelineTitle'>{project.name}</h3>
        <Stepper orientation={'vertical'}>{this.renderTimeline()}</Stepper>
      </div>
    ) : null;
  }
}

const mapStateToProps = (state: RootState) => ({
  timeline: state.projects.timeline,
  projectUpdatedAt: state.projects.projectUpdatedAt
});

export default connect<StateProps, unknown, OwnProps>(mapStateToProps)(injectIntl(ProjectTimeline));
