/* istanbul ignore file */

import findByTitleAndLocale from './find-by-title-and-locale';
import {
  applyPatchOperations,
  authVerifyToken,
  cleanUpPatchResponse,
  includeSoftDeletedData,
  initPatch,
  isSoftDeletedDataIncluded,
  validateSchema
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

const findRequestSchema = schemas.get('tip-find-request.json');
const getRequestSchema = schemas.get('tip-get-request.json');
const createRequestSchema = schemas.get('tip-create-request.json');
const patchOperationsSchema = schemas.get('patch-operations-request.json');
const patchRequestSchema = schemas.get('tip-patch-request.json');
const common = require('feathers-hooks-common');
/**
 * @url /tips
 */
export const before = {
  all: [
    authVerifyToken()
  ],
  /**
   * A list of tips as JSON objects
   * @name Find tips
   * @requestSchema tip-find-request
   * @returns
   * [{
   * "id": 1,
   * "title": {
   *  "EN": "This is EN title",
   *  "DK": "Det er en DK title",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "content": {
   *  "EN": "This is the content in EN",
   *  "DK": "Det er contenten i Dansk",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
   * "isActive": true
   * }]
   */
  find: [
    validateSchema(findRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData(),
    findByTitleAndLocale()
  ],
  /**
   * An tips as a JSON object
   * @name Get tips
   * @requestSchema tip-get-request
   * @returns
   * {
   * "id": 1,
   * "title": {
   *  "EN": "This is EN title",
   *  "DK": "Det er en DK title",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "content": {
   *  "EN": "This is the content in EN",
   *  "DK": "Det er contenten i Dansk",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
   * "isActive": true
   * }
   */
  get: [
    validateSchema(getRequestSchema, { coerceTypes: true }),
    includeSoftDeletedData()
  ],
  /**
   * Creates new tip
   * @name Create tip
   * @requestSchema tip-create-request
   * @example
   * {
   * "title": {
   *  "EN": "This is EN title",
   *  "DK": "Det er en DK title",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "content": {
   *  "EN": "This is the content in EN",
   *  "DK": "Det er contenten i Dansk",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
   * "isActive": true
   * }
   * @returns
   * {
   * "id": 1,
   * "title": {
   *  "EN": "This is EN title",
   *  "DK": "Det er en DK title",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "content": {
   *  "EN": "This is the content in EN",
   *  "DK": "Det er contenten i Dansk",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
   * "isActive": true
   * }
   */
  create: [
    authVerifyToken({ isAdminRequired: true }),
    validateSchema(createRequestSchema, { coerceTypes: true })
  ],
  update: [common.disallow()],
  /**
   * Patches a tip
   * @name Patch tip
   * @requestSchema patch-operations-request
   * @example
   * [{
	 * "op": "replace",
	 * "path": "/title/EN",
	 * "value": "A new title in English"
   * }]
   * @returns
   * {
   * "id": 1,
   * "title": {
   *  "EN": "A new title in english",
   *  "DK": "Det er en DK title",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "content": {
   *  "EN": "This is the content in EN",
   *  "DK": "Det er contenten i Dansk",
   *  "NO": "Blah blah in Norwegian"
   * },
   * "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
   * "isActive": false
   * }
   */
  patch: [
    validateSchema(patchOperationsSchema, { coerceTypes: true }),
    initPatch({ endpointName: 'tips', entityName: 'tip' }),
    applyPatchOperations({ entityName: 'tip' }),
    validateSchema(patchRequestSchema, { coerceTypes: true })
  ],
  remove: [common.disallow('external')]
};

export const after = {
  all: [
    /*
     * When a ORM such as Sequelize is Used, feathersJS returns the whole output
     * from it, following piece of code, cleans up the output
     */
    hook => {
      hook.result = JSON.parse(JSON.stringify(hook.result));
      return hook;
    },
    common.discard('createdAt'),
    common.discard('updatedAt'),
    common.unless(isSoftDeletedDataIncluded(), common.discard('deletedAt'))
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [
    cleanUpPatchResponse()
  ],
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
