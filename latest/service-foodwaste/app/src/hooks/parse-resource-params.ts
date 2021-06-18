import { Hook, HookContext } from '@feathersjs/feathers';
import { FOODWASTE_RESOURCE_TYPES } from '../util/constants';

/**
 * Parses resource query parameter.
 *
 * Used for backwards compatibility: client still uses separate endpoints
 * for foodwaste and foodwaste-per-guest endpoints. After moving per-guest to query parameter, this handles
 * parsing the query parameters from URL path
 *
 * Before Hook: FIND
 *
 */

const PER_GUEST_PATH_REGEX = /^reports\/foodwaste-per-guest\b/;

export default (): Hook => {
  return async (hook: HookContext): Promise<HookContext> => {

    const { method, path, params: { query } } = hook;

    if(method !== 'find') {
      return hook;
    }

    if(query['resource'] && FOODWASTE_RESOURCE_TYPES[query['resource']]) {
      return hook;
    }

    hook.params.query['resource'] = PER_GUEST_PATH_REGEX.test(path) ? FOODWASTE_RESOURCE_TYPES.perGuest : FOODWASTE_RESOURCE_TYPES.total;

    return hook;
  };
};
