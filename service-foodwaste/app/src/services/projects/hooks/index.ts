/* istanbul ignore file */

import associateWithExistingRegistrations from './associate-with-existing-registrations';
import getParentProject from './get-parent-project';
import preventMultipleRunningFollowUps from './prevent-multiple-running-follow-ups';
import validateParentProjectStatus from './validate-parent-project-status';
import getFollowUpProjects from './get-follow-up-projects';
import calculatePercentageOfCompletion from './calculate-percentage-of-completion';
import parseJsonResult from '../../../hooks/parse-json-result';
import * as validateStatus from './validate-status';
import patchActionEntity from './patch-action-entity';
import finishChildrenWithParent from './finish-children-with-parent';
import validateDependenciesAreActive from './validate-dependencies-are-active';
import setProjectPeriod from './set-project-period';
import cleanRegistrationPointsResponse from './clean-project-registration-points';
import createOrPatchProject from './create-or-patch-project';
import includeRegistrationPoints from './include-registration-points';
import parseAccountParams from '../../../hooks/parse-account-params';

import {
  applyPatchOperations,
  authVerifyToken,
  cleanUpPatchResponse,
  formatUniqueViolationErrors,
  includeSoftDeletedData,
  initPatch,
  isSoftDeletedDataIncluded,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';
import { disallow, discard, unless } from 'feathers-hooks-common';

const status: any = validateStatus;
const findRequestSchema = schemas.get('project-find-request.json');
const createRequestSchema = schemas.get('project-create-request.json');
const getRequestSchema = schemas.get('project-get-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchRequestSchema = schemas.get('project-patch-request.json');

/**
 * @url /projects
 */
export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer(),
    includeRegistrationPoints()
  ],
  /**
   * A list of projects as JSON objects
   * @name Find projects
   * @requestSchema project-find-request
   * @returns
   * [{
   * "id": "2",
   * "parentProjectId": "1",
   * "name": "Project Name",
   * "duration": {
   * "days": 10,
   * "period": 2,
   *"type": "REGISTRATIONS"
   * },
   * "status": "RUNNING_FOLLOWUP",
   * "registrationPoints": [
   * {
   *   "id": 1,'
   *   "path: "12.13.2",
   *   'awaiian pizza",

   * },
   * {
   *   "id": 2,
   *   "name": "Chicken wings",
   *   "goal": 30
   * }
   * ],
   * "actions": [
   * {
   *   "id": 1,
   *   "name": "Use smaller plates"
   * },
   * {
   *   "id": 2,
   *   "name": "Use napkins with drawings"
   * }
   * ],
   * "userId": "1",
   * "customerId": "1",
   * "active": true,
   * "percentage": 100,
   * "followUpProjects": [
   *     {
   *         "id": "7",
   *         "parentProjectId": "2",
   *         "name": "Proyecto 3 parent",
   *         "duration": {
   *             "days": 10,
   *             "type": "REGISTRATIONS"
   *         },
   *         "status": "RUNNING",
   *         "registrationPoints": [
   *             {
   *                 "id": 6,
   *                 "name": "Chicken wings"
   *             }
   *         ],
   *         "actions": [],
   *         "userId": "3",
   *         "customerId": "3",
   *         "active": true,
   *         "percentage": 50,
   *         "period": 2,
   *         "followUpProjects": []
   *     }
   * ]
   * }]
   */
  find: [
    unless(hook => (hook.params.accessTokenPayload && hook.params.accessTokenPayload.isAdmin) || !hook.params.provider,
      validateSchema(findRequestSchema, { coerceTypes: true })
    ),
    includeSoftDeletedData(),
    parseAccountParams()
  ],
  /**
   * A project as JSON object
   * @name Get projects
   * @requestSchema project-get-request
   * @returns
   * {
   * "id": "2",
   * "parentProjectId": "1",
   * "name": "Project Name",
   * "duration": {
   * "days": 10,
   * "period": 2,
   *"type": "REGISTRATIONS"
   * },
   * "status": "RUNNING_FOLLOWUP",
   * "registrationPoints": [
   * {
   *   "id": 1,
   *   "name": "Hawaiian pizza",
   *   "goal": 20
   * },
   * {
   *   "id": 2,
   *   "name": "Chicken wings",
   *   "goal": 30
   * }
   * ],
   * "actions": [
   * {
   *   "id": 1,
   *   "name": "Use smaller plates"
   * },
   * {
   *   "id": 2,
   *   "name": "Use napkins with drawings"
   * }
   * ],
   * "userId": "1",
   * "customerId": "1",
   * "active": true,
   * "percentage": 100,
   * "followUpProjects": [
   *     {
   *         "id": "7",
   *         "parentProjectId": "2",
   *         "name": "Proyecto 3 parent",
   *         "duration": {
   *             "days": 10,
   *             "type": "REGISTRATIONS"
   *         },
   *         "status": "RUNNING",
   *         "registrationPoints": [
   *             {
   *                 "id": 6,
   *                 "name": "Chicken wings"
   *             }
   *         ],
   *         "actions": [],
   *         "userId": "3",
   *         "customerId": "3",
   *         "active": true,
   *         "percentage": 100,
   *         "period": 2,
   *         "followUpProjects": []
   *     }
   * ]
   * }
   */
  get: [
    validateSchema(getRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData()
  ],
  /**
   * Creates new project
   * @name Create project
   * @requestSchema project-create-request
   * @example
   * {
   * "parentProjectId": "1",
   * "name": "Project Name",
   * "duration": {
   * "days": 10,
   *"type": "REGISTRATIONS"
   * },
   * "status": "PENDING_START",
   * "registrationPoints": [
   * {
   *   "id": 1,
   *   "name": "Hawaiian pizza"
   * },
   * {
   *   "id": 2,
   *   "name": "Chicken wings"
   * }
   * ],
   * "actions": [
   * {
   *   "id": 1,
   *   "name": "Use smaller plates"
   * },
   * {
   *   "id": 2,
   *   "name": "Use napkins with drawings"
   * }
   * ]
   * }
   * @returns
   * {
   * "id": 2,
   * "parentProjectId": "1",
   * "name": "Project Name",
   * "duration": {
   * "days": 10,
   *"type": "REGISTRATIONS"
   * },
   * "status": "PENDING_START",
   * "registrationPoints": [
   * {
   *   "id": 1,
   *   "name": "Hawaiian pizza"
   * },
   * {
   *   "id": 2,
   *   "name": "Chicken wings"
   * }
   * ],
   * "actions": [
   * {
   *   "id": 1,
   *   "name": "Use smaller plates"
   * },
   * {
   *   "id": 2,
   *   "name": "Use napkins with drawings"
   * }
   * ],
   * "userId": "1",
   * "customerId": "1",
   * "active": true,
   * "percentage": 0,
   * "period": 2
   * }
   */
  create: [
    discard('active'),
    /*
     * Default status is PENDING_START
     */
    (hook) => {
      hook.data.status = 'PENDING_START';
      return Promise.resolve(hook);
    },
    validateSchema(createRequestSchema, { coerceTypes: true }),
    validateDependenciesAreActive(),
    getParentProject(),
    preventMultipleRunningFollowUps(),
    validateParentProjectStatus(),
    setProjectPeriod(),
    createOrPatchProject()
  ],
  update: [disallow()],
  /**
   * Patches a project
   * @name Patch project
   * @requestSchema patch-operations-request
   * @example
   * [{
   * "op": "add",
   * "path": "/registrationPoints/0/goal",
   * "value": 20
   * }]
   * @returns
   * {
   * "id": 2,
   * "parentProjectId": "1",
   * "name": "Project Name",
   * "duration": {
   * "days": 10,
   * "period": 2,
   *"type": "REGISTRATIONS"
   * },
   * "status": "PENDING_FOLLOWUP",
   * "registrationPoints": [
   * {
   *   "id": 1,
   *   "name": "Hawaiian pizza",
   *   "goal": 20
   * },
   * {
   *   "id": 2,
   *   "name": "Chicken wings"
   * }
   * ],
   * "actions": [
   * {
   *   "id": 1,
   *   "name": "Use smaller plates"
   * },
   * {
   *   "id": 2,
   *   "name": "Use napkins with drawings"
   * }
   * ],
   * "userId": "1",
   * "customerId": "1",
   * "percentage": 100,
   * "followUpProjects": [
   *     {
   *         "id": "7",
   *         "parentProjectId": "2",
   *         "name": "Proyecto 3 parent",
   *         "duration": {
   *             "days": 10,
   *             "type": "REGISTRATIONS"
   *         },
   *         "status": "PENDING_START",
   *         "registrationPoints": [
   *             {
   *                 "id": 6,
   *                 "name": "Chicken wings"
   *             }
   *         ],
   *         "actions": [],
   *         "userId": "3",
   *         "customerId": "3",
   *         "active": true,
   *         "percentage": 0
   *         "period": 2,
   *         "followUpProjects": []
   *     }
   * ]
   * }
   */
  patch: [
    validateSchema(patchOperationsSchema, { coerceTypes: true }),
    initPatch({ endpointName: 'projects', entityName: 'project' }),
    hook => {
      const { project } = hook;
      // we need only the registration point ids for patch request
      project.registrationPoints = project.registrationPoints.map(registrationPoint => ({ id: parseInt(registrationPoint.id) }));
      return hook;
    },
    applyPatchOperations({ entityName: 'project' }),
    patchActionEntity(),
    validateSchema(patchRequestSchema, { coerceTypes: true }),
    getParentProject(),
    preventMultipleRunningFollowUps(),
    validateParentProjectStatus(),
    finishChildrenWithParent(),
    createOrPatchProject()
  ],
  remove: []
};

export const after = {
  all: [
    parseJsonResult(),
    discard('createdAt'),
    discard('updatedAt'),
    unless(isSoftDeletedDataIncluded(), discard('deletedAt')),
    calculatePercentageOfCompletion(),
    getFollowUpProjects(),
    status.route(),
    cleanRegistrationPointsResponse()
  ],
  find: [],
  get: [],
  create: [
    associateWithExistingRegistrations()
  ],
  update: [],
  patch: [
    cleanUpPatchResponse(),
    associateWithExistingRegistrations()
  ],
  remove: []
};

export const error = {
  all: [formatUniqueViolationErrors()],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
