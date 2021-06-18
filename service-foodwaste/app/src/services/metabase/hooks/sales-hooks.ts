/* istanbul ignore file */

import {
  authVerifyToken,
  populateUserAndCostumer,
  validateSchema,
  verifyUserAllowedToQueryAccounts
} from 'feathers-hooks-esmiley';
import * as schemas from 'schemas';

const findRequestSchema = schemas.get('metabase-sales-find-request.json');

/**
 * @url /metabase/sales
 */
export const before = {
  find: [
    authVerifyToken(),
    validateSchema(findRequestSchema, { coerceTypes: true }),
    populateUserAndCostumer(),
    verifyUserAllowedToQueryAccounts()
  ]
};

export const after = {
  find: []
};

export const error = {
  find: []
};
