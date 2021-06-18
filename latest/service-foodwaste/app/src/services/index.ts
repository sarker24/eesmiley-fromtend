import registrations from './registrations';
import actions from './actions';
import settings from './settings';
import sales from './sales';
import projects from './projects';
import ingredients from './ingredients';
import healthCheck from './health-check';
import status from './status';
import ping from './ping';
import tips from './tips';
import uploads from './uploads';
import jobs from './jobs';
import metabase from './metabase';
import registrationPoints from './registration-points';
import guestTypes from './guest-types';
import accountStatus from './account-status';
import guestRegistrations from './guest-registrations';
import reports from './reports';
import targets from './targets';
import templates from './templates';
import bootstrapTasks from './bootstrap-tasks';
import dashboard from './dashboard';

import * as commons from 'feathers-commons-esmiley';

export default function (): void {
  commons.init(
    this,
    {
      /*
       * IMPORTANT: add service objects to the array here
       */
      services: [
        ping,
        status,
        healthCheck,
        registrations,
        actions,
        projects,
        sales,
        settings,
        ingredients,
        tips,
        uploads,
        jobs,
        metabase,
        registrationPoints,
        guestTypes,
        accountStatus,
        guestRegistrations,
        reports,
        targets,
        templates,
        bootstrapTasks,
        dashboard
      ]
    });
}
