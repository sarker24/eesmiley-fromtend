import * as React from 'react';
import { CircularProgress, IconButton } from '@material-ui/core';
import moment from 'moment';
import EditIcon from '@material-ui/icons/Edit';
import { browserHistory } from 'react-router';
import ProjectRegistrationPoints from 'project/components/projectRegistrationPoints';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Project } from 'redux/ducks/projects';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import './index.scss';

export interface OwnProps {
  project: Project;
  closeModal: () => void;
  registrationPoints: RegistrationPoint[];
}

type ProjectStatusPanelProps = InjectedIntlProps & OwnProps;

function ProjectStatusPanel(props: ProjectStatusPanelProps) {
  const { project, registrationPoints, intl } = props;

  //FIXME: ADD DURATION TO THE INFORMATION
  return (
    <div className='projectStatusPanel'>
      <div className='projectStatusPanelHeader'>
        <div className='projectProgress'>
          <p className='projectPercentage'>{project.percentage ? project.percentage : 0}%</p>
          <CircularProgress
            variant='determinate'
            value={project.percentage ? project.percentage : 0}
            size={120}
            thickness={3}
          />
        </div>
      </div>
      <div className='projectStatusPanelBody'>
        <div className='projectDetails'>
          <dl>
            <dt className='projectInformationTitle'>
              <span>{intl.messages['project.dialog.projectInfo']}</span>
              <IconButton
                className='projectEditButton'
                title={intl.messages['edit']}
                onClick={() => {
                  props.closeModal();
                  browserHistory.push(`/project?preselected=${project.id}`);
                }}
              >
                <EditIcon />
              </IconButton>
            </dt>
          </dl>
          <dl>
            <dt>{intl.messages['name']}</dt>
            <dd>{project.name}</dd>
          </dl>
          <dl>
            <dt>{intl.messages['registrationPoints']}</dt>
            <dd>
              <ProjectRegistrationPoints
                registrationPoints={registrationPoints}
                projectRegistrationPoints={project.registrationPoints}
                inReadMode={true}
              />
            </dd>
          </dl>
          <dl>
            <dt>
              {project.duration
                ? project.duration.days && !project.duration.end
                  ? intl.messages['project.dialog.info.durationByReg']
                  : intl.messages['project.dialog.info.durationByDate']
                : null}
            </dt>
            <dd>
              {project.duration
                ? project.duration.days && !project.duration.end
                  ? `${project.duration.days}d`
                  : `${moment(moment.unix(project.duration.start)).format('DD-MM-YYYY')} - ${moment(
                      moment.unix(project.duration.end)
                    ).format('DD-MM-YYYY')}`
                : null}
            </dd>
          </dl>
          {project.actions && project.actions.length > 0 ? (
            <dl>
              <dt>{intl.messages['project.dialog.info.actionsImplemented']}</dt>
              <dd>
                {project.actions.map((action: { name: string }, index: number) => {
                  return (
                    <span key={index}>
                      {action.name}
                      <br />
                    </span>
                  );
                })}
              </dd>
            </dl>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default injectIntl(ProjectStatusPanel);
