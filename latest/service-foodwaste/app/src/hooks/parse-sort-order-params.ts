import { Hook, HookContext } from '@feathersjs/feathers';
import { SortOrder } from '../util/constants';

/**
 * Parses sort parameter
 * Before Hook: FIND
 *
 */

const DefaultOrder: SortOrder = SortOrder.desc;

export default (): Hook => {
  return  (hook: HookContext): HookContext => {

    if(hook.method !== 'find') {
      return hook;
    }

    const query = hook.params.query;
    const orderParam: string = query['order'];
    query['order'] = orderParam && SortOrder[orderParam] ? SortOrder[orderParam] : DefaultOrder;
    return hook;
  };
};
