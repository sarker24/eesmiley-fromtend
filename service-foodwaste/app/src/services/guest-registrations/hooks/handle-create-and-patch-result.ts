import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return async (hook: HookContext) => {
    if (['create', 'patch'].includes(hook.method)) {
      const registration = hook.result;
      hook.result = await hook.service.get(registration.id);
    }
    return hook;
  };
};
