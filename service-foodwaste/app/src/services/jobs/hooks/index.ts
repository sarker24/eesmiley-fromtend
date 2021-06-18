/* istanbul ignore file */

import { disallow } from 'feathers-hooks-common';
import { Forbidden } from '@feathersjs/errors';

/**
 * @url /jobs
 * @description Execute re-occurring, arbitrary jobs in the FW service
 */
export const before = {
  all: [],
  find: [disallow()],
  get: [disallow()],
  create: [
    hook => {
      /*
       * Disallow for external calls
       */
      if (hook.params.provider) {
        throw new Forbidden('Method not allowed');
      }
    }
  ],
  update: [disallow()],
  patch: [disallow()],
  remove: [disallow()]
};

export const after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
