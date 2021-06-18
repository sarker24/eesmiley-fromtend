import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return async (hook: HookContext) => {
    const startDate: string = hook.params.query['startDate'];
    const endDate: string = hook.params.query['endDate'];
    const date: string = hook.params.query['date'];

    if (!date) {
      const period = [
        startDate ? { $gte: startDate } : null,
        endDate ? { $lte: endDate } : null
      ].filter(entry => entry);

      if (period.length > 0) {
        hook.params.query['date'] = Object.assign({}, ...period);
      }
    }

    delete hook.params.query.startDate;
    delete hook.params.query.endDate;

    return hook;
  };
};
