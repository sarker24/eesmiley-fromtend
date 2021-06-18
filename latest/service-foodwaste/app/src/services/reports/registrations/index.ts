import * as errors from '@feathersjs/errors';
import { Params, Application, HookContext, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';

const subModule = 'reports/registrations';

class RegistrationService implements SetupMethod, Pick<ServiceMethods<any>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<any> {
    const { date, customerId } = params.query;

    try {

      const includeRegistrationPoints = {
        attributes: ['id', 'parentId', 'path', 'name', 'label'],
        model: this.sequelize.models.registration_point,
        as: 'registrationPoint',
        paranoid: false
      };

      const queryOptions: any = {
        attributes: ['id', 'customerId', 'date', 'cost', 'amount', 'co2', 'comment'],
        where: { date, customerId },
        raw: true,
        // raw: true returns associations with dot notation,
        // nest: true uses dottie.js to build object notation
        nest: true,
        include: [includeRegistrationPoints]
      };

      return await this.sequelize.models.registration.findAll(queryOptions);

    } catch (err) {
      throw new errors.GeneralError('Could not get registrations', {
        errorCode: '500',
        subModule,
        input: params.query,
        errors: err,
        requestId: params.requestId,
        sessionId: params.sessionId
      });
    }
  }
}

export default RegistrationService;

