import { Hook, HookContext } from '@feathersjs/feathers';

/**
 *
 * Before hook: FIND
 *
 * */

export default (): Hook => {
  return (hook: HookContext) => {

    if (hook.method !== 'find') {
      return hook;
    }

    const { start, end } = hook.params.query;
    const date = (start || end) && Object.assign({}, start && { $gte: start }, end && { $lte: end });
    delete hook.params.query.start;
    delete hook.params.query.end;
    hook.params.query = Object.assign({}, hook.params.query, date && { date });
    return hook;
  };
};
