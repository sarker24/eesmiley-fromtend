/* istanbul ignore file */

import { Hook, HookContext } from '@feathersjs/feathers';
export default (): Hook => {
  return async (hook: HookContext) => {
    const { area, category, product } = hook.params.query;

    const mostSpecificFilter: string = product || category || area;
    const ids: number[] = mostSpecificFilter ?
      mostSpecificFilter.split(',').map(id => parseInt(id)) :
      [];

    delete hook.params.query.area;
    delete hook.params.query.category;
    delete hook.params.query.product;

    hook.params.query = {
      ...hook.params.query,
      registrationPointIds: ids
    };

    return hook;

  };
};
