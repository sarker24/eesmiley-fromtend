/* istanbul ignore file */

import filterCurrentSettings from './filter-current-settings';
import filterSettingsProperties from './filter-settings-properties';
import appendToHistory from './append-to-history';
import checkSubscribedAccountsHaveSettings from './check-subscribed-accounts-have-settings';
import setAccountName from './set-account-name';
import validateGuestTypeFlag from './validate-guest-type-flag';
import processGuestTypeFlag from './process-guest-type-flag';
import createBootstrapTask from './create-bootstrap-task-hook';
import validateAccountSubscriptions from './validate-account-subscriptions-hook';
import processWasteTargets from './process-waste-targets';
import filterNormalizedWasteTargets from './filter-normalized-waste-targets';

import {
  applyPatchOperations,
  authVerifyToken,
  cleanUpPatchResponse,
  initPatch,
  populateUserAndCostumer,
  validateSchema
} from 'feathers-hooks-esmiley';
import { disallow } from 'feathers-hooks-common';
import * as schemas from 'schemas';
import { Hook } from '@feathersjs/feathers';

const createRequestSchema = schemas.get('settings-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchSchema = schemas.get('settings-patch-request.json');

/**
 * @url /settings
 * @description Create, get foodwaste settings for a user
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
   * {
   *     "name: "Some company",
   *     "unit": "kg",
   *     "sound": {
   *         "enabled": true
   *     },
   *     "accounts": [
   *         {
   *             "id": 24759,
   *             "name": "Testaftale 12",
   *             "settingsAreSet": true
   *         },
   *         {
   *             "id": 24772,
   *             "name": "Child 2",
   *             "settingsAreSet": true
   *         },
   *         {
   *             "id": 24771,
   *             "name": "Child 1",
   *             "settingsAreSet": false
   *         }
   *     ],
   *     "currency": "DKK",
   *     "database": "",
   *     "mandatory": [],
   *     "lastUpload": null,
   *     "bootstrapData": false,
   *     "categoriesHidden": false,
   *     "expectedWeeklyWaste": {
   *         "0": 12345,
   *         "2018-09-13": 12345
   *     },
   *     "showDeactivatedAreas": false,
   *     "registrationsFrequency": {
   *         "0": [
   *             1,
   *             3,
   *             5
   *         ]
   *     }
   * }
   */
  find: [],
  get: [],
  /**
   * Store foodwaste settings for a user, by customerId
   * @name Create settings
   * @requestSchema settings-request
   * @example
   * {
   *   "settings" : {
   *     "areas": [
   *       "Køkken"
   *     ],
   *     "currency": "DKK",
   *     "categories": [
   *       {
   *         "name": "Kød",
   *         "products": [
   *           {
   *             "cost": 7500,
   *             "name": "Svin"
   *           }
   *         ]
   *       }
   *     ]
   *   }
   * }
   * @returns
   * {
   *   "name: "Some company",
   *   "areas": [
   *     "Køkken"
   *   ],
   *   "currency": "DKK",
   *   "categories": [
   *     {
   *       "name": "Kød",
   *       "products": [
   *         {
   *           "cost": 7500,
   *           "name": "Svin"
   *         }
   *       ]
   *     }
   *   ]
   * }
   */
  create: [
    validateSchema(createRequestSchema, { coerceTypes: true }),
    validateAccountSubscriptions(),
    checkSubscribedAccountsHaveSettings(),
    validateGuestTypeFlag(),
    processGuestTypeFlag(),
    processWasteTargets(),
    setAccountName() as Hook,
    filterSettingsProperties() as Hook,
    appendToHistory()

  ],
  update: [disallow()],
  /**
   * Patches a settings record
   * @name Patch settings
   * @requestSchema patch-operations-request
   * @example
   * [{
   * "op": "replace",
   * "path": "/current/currency",
   * "value": "COP"
   * }]
   * @returns
   * {
   * "createTime": "2017-08-03 07:51:31",
   * "updateTime": "2017-08-03 14:21:30",
   * "id": "1",
   * "current": {
   *  "areas": [
   *    "Køkkeana3"
   *  ],
   *  "currency": "COP"
   * },
   * "history": {
   *  "1501750205325": {
   *    "userId": "1",
   *    "settings": {
   *      "areas": [
   *        "Køkkeana3"
   *      ],
   *      "currency": "DKK"
   *    },
   *    "customerId": "1"
   *  },
   *  "currentTimestamp": {
   *    "userId": "1",
   *    "settings": {
   *      "areas": [
   *        "Køkkeana2"
   *      ],
   *      "currency": "DKK"
   *    },
   *    "customerId": "1"
   *  }
   * },
   * "customerId": "1",
   * "userId": "1"
   * }
   */
  patch: [
    validateSchema(patchOperationsSchema, { coerceTypes: true }),
    initPatch({ endpointName: 'settings', entityName: 'settings' }),
    applyPatchOperations({ entityName: 'settings' }),
    validateSchema(patchSchema, { coerceTypes: true }),
    validateAccountSubscriptions(),
    validateGuestTypeFlag(),
    processGuestTypeFlag(),
    processWasteTargets()
  ],
  remove: [disallow()]
};

export const after = {
  all: [],
  find: [
    setAccountName() as Hook,
    filterCurrentSettings(),
    filterNormalizedWasteTargets(),
    checkSubscribedAccountsHaveSettings() as Hook
  ],
  get: [],
  create: [
    filterCurrentSettings(),
    filterNormalizedWasteTargets(),
    createBootstrapTask()
  ],
  update: [],
  patch: [cleanUpPatchResponse()],
  remove: []
};
