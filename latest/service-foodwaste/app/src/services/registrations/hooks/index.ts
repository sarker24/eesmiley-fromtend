/* istanbul ignore file */
import findForMultipleCustomers from './find-for-multiple-customers';
import associateRegistrationWithProjects from './associate-registration-with-projects';
import calculateRegistrationCost from './calculate-registration-cost';
import calculateRegistrationCO2Emission from './calculate-registration-co2-emission';
import validateForeignKeysAreActive from './validate-foreign-keys-are-active';
import getAsRichObject from './get-as-rich-object';
import parseAccountParams from '../../../hooks/parse-account-params';
import { disallow } from 'feathers-hooks-common';
import {
  authVerifyToken,
  includeSoftDeletedData,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

const findRequestSchema = schemas.get('registration-find-request.json');
const createRequestSchema = schemas.get('registration-create-request.json');

/**
 * @url /registrations
 */
export const before = {
  all: [
    (hook) => {
      delete hook.app.response.statusCode;
    },
    authVerifyToken(),
    populateUserAndCostumer()
  ],
  /**
   * A list of registrations as JSON objects
   * @name Find registration
   * @requestSchema registration-find-request
   * @returns
   * [{
   *   "id": 4,
   *   "date": "2017-02-07",
   *   "currency": "DKK",
   *   "customerId": 1,
   *   "userId": 1,
   *   "amount": 35,
   *   "unit": "lt",
   *   "kgPerLiter": null,
   *   "cost": null,
   *   "comment": null,
   *   "manual": true,
   *   "scale": null,
   *   "createdAt": "2017-03-15 13:04:12",
   *   "updatedAt": "2017-03-15 13:04:12",
   *    "registrationPoint": {
   *        "deletedAt": null,
   *        "id": "2",
   *        "name": "Chicken",
   *        "cost": 1000,
   *        "image": null,
   *        "userId": "1",
   *        "amount": 1000,
   *        "costPerkg": null,
   *        "customerId": "1",
   *        "active": true
   *    }
   * }]
   */
  find: [
    validateSchema(findRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData(),
    parseAccountParams(),
    findForMultipleCustomers()
  ],
  get: [disallow()],
  /**
   * Creates new foodwaste registration
   * @name Create registration
   * @requestSchema registration-create-request
   * @example
   * {
   *   "date": "2017-02-07",
   *   "currency": "DKK",
   *   "amount": 35,
   *   "unit": "lt",
   *   "manual": true,
   *   "registrationPointId": 1
   * }
   * @returns
   * {
   *   "id": "4",
   *   "date": "2017-02-07",
   *   "currency": "DKK",
   *   "customerId": "1",
   *   "userId": "1",
   *   "amount": 35,
   *   "unit": "lt",
   *   "kgPerLiter": null,
   *   "cost": null,
   *   "comment": null,
   *   "manual": true,
   *   "scale": null,
   *   "createdAt": "2017-03-15 13:04:12",
   *   "updatedAt": "2017-03-15 13:04:12",
   *   "registrationPointId: 1
   * }
   */
  create: [
    validateSchema(createRequestSchema, { coerceTypes: true }),
    validateForeignKeysAreActive(),
    calculateRegistrationCost(),
    calculateRegistrationCO2Emission()
  ],
  update: [disallow()],
  patch: [disallow()],
  remove: []
};

export const after = {
  all: [
    (hook) => {
      hook.result = JSON.parse(JSON.stringify(hook.result));
    }
  ],
  find: [],
  get: [],
  create: [
    associateRegistrationWithProjects(),
    getAsRichObject()
  ],
  update: [],
  patch: [],
  remove: []
};

export const error = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
