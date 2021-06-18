import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import * as errors from 'feathers-errors';

const subModule = 'bootstrap-from-template';

/*
 Populates customer's registration points from given template.
 Probably could make a task out of this, since it might take a moment to compute,
 eg return a response with uri to check result and/or use socket approach
* */
class BootstrapTaskService implements SetupMethod, Pick<ServiceMethods<any>, 'create'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async create(data, params: Params): Promise<void> {
    const { requestId, sessionId } = params;
    const { templateId, customerId } = data;

    const template = await this.sequelize.models.template.findOne({ where: { id: templateId } });

    if (!template) {
      throw new errors.NotFound(`Could not load template: ${templateId} does not exist`, {
        requestId, sessionId, subModule
      });
    }

    try {
      await this.sequelize.query('SELECT bootstrap_from_template(:templateId::BIGINT, ARRAY[:customerIds]::BIGINT[], false)', {
        replacements: { templateId: template.templateAccountId, customerIds: customerId },
        raw: true
      });
    } catch (error) {
      throw new errors.GeneralError(`Could not create registration points from template ${templateId}`, {
        errorCode: 500,
        subModule,
        requestId,
        sessionId
      });
    }
    return null;
  }
}

export default BootstrapTaskService;
