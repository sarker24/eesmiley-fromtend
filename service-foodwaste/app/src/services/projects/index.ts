import projectModel from './project-model';
import projectRegistrationPointModel from './project-registration-point-model';

import projectsActions from './projects-actions';
import projectsRegistrations from './projects-registrations';
import ProjectsTimeLine from './projects-timeline';

import * as hooks from './hooks';
import * as projectsActionsHooks from './hooks/projects-actions-hooks';
import * as projectsRegistrationsHooks from './hooks/projects-registations-hooks';
import * as projecstTimelineHooks from './hooks/projects-timeline-hooks';
const { Service } = require('feathers-sequelize');

export default function () {
  const app: any = this;

  projectRegistrationPointModel(app.get('sequelize'), app.get('Sequelize'));

  app.use('/projects', new Service({
    Model: projectModel(app.get('sequelize'), app.get('Sequelize'))
  }));

  const projectsService: any = app.service('/projects');

  projectsService.hooks(hooks);

  app.use('/projects/:projectId/actions', projectsActions(app));
  app.service('/projects/:projectId/actions').hooks(projectsActionsHooks);

  app.use('/projects/:projectId/registrations', projectsRegistrations(app));
  app.service('/projects/:projectId/registrations').hooks(projectsRegistrationsHooks);

  app.use('/projects/:projectId/timeline', new ProjectsTimeLine(app));
  app.service('/projects/:projectId/timeline').hooks(projecstTimelineHooks);
}
