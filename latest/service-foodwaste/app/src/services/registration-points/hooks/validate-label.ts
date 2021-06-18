import { Hook, HookContext } from '@feathersjs/feathers';

/*
* biz rule (PR-4898):
* everything beyond depth 2 are hard coded with product label
*
* BEFORE HOOK: CREATE, PATCH
*
* */
type MaxQuery = {
  max: number
};

export const MAX_DEPTH_FOR_CUSTOM_LABELS = 2;
export const DEFAULT_LABEL = 'product';

export default (): Hook => {
  return async (hook: HookContext): Promise<HookContext> => {
    const { parentId } = hook.data;
    const sequelize = hook.app.get('sequelize');
    if (!parentId) {
      return hook;
    }

    const parentDepthResult: Array<MaxQuery> = await sequelize.query('SELECT COALESCE(MAX(NLEVEL(path)), 0) as max FROM registration_point WHERE path ~ :parentId', {
      replacements: {
        parentId: `*.${parentId}`
      },
      type: sequelize.QueryTypes.SELECT
    });

    const parentDepth = parentDepthResult[0].max;

    if (parentDepth >= MAX_DEPTH_FOR_CUSTOM_LABELS) {
      hook.data.label = DEFAULT_LABEL;
    }

    return hook;

  };
};
