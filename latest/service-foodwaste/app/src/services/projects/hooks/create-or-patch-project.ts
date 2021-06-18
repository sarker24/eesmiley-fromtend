// create/patch with existing association targets using ids only not that trivial,
// this here overrides create method by setting hook.result instead of passing
// registration points via hook context and handling them separately in after hook.
// see:
// https://github.com/sequelize/sequelize/issues/5325
// https://github.com/sequelize/sequelize/issues/3807

import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'create-or-patch-project';

/**
 * Before hook: CREATE, PATCH
 */
export default (): Hook => {
  return async (hook: HookContext) => {
    let project;
    const { requestId, sessionId } = hook.params;
    const sequelize = hook.app.get('sequelize');

    try {
      if (hook.method === 'create') {
        project = await createProject(hook);
      } else if (hook.method === 'patch') {
        project = await patchProject(hook);
      } else {
        return hook;
      }

      const withRegistrationPoints = await sequelize.models.project.findOne({
        where: {
          id: project.id
        },
        include: [{
          attributes: ['id', 'path', 'name'],
          model: sequelize.models.registration_point,
          as: 'registrationPoints',
          through: { attributes: [] }
        }]
      });

      // overrides feathers-sequelize method
      hook.result = withRegistrationPoints;
      return hook;
    } catch (error) {
      throw new errors.GeneralError(`Could not ${hook.method} Project`, {
        errorCode: 'E265', errors: error, project, subModule, requestId, sessionId
      });
    }
  };
};

export async function createProject(hook) {
  const sequelize = hook.app.get('sequelize');
  const { registrationPoints, ...projectData } = hook.data;
  const registrationPointIds = registrationPoints.map(({ id }) => id);

  return await sequelize.transaction(async transaction => {
    const project = await sequelize.models.project.create(projectData, { transaction });

    await project.addRegistrationPoints(registrationPointIds, { save: false, transaction });
    await project.save({ transaction });

    return project;
  });
}

export async function patchProject(hook) {
  const sequelize = hook.app.get('sequelize');
  const { registrationPoints, ...projectData } = hook.data;
  const registrationPointIds = registrationPoints.map(({ id }) => id);

  return await sequelize.transaction(async transaction => {
    const [count, projects] = await sequelize.models.project.update(projectData, {
      where: { id: projectData.id },
      returning: true,
      transaction
    });

    const project = projects[0];
    await project.setRegistrationPoints([], { transaction });
    await project.addRegistrationPoints(registrationPointIds, { transaction });
    return project;
  });
}

