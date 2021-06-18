import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule: string = 'find-for-multiple-customers-hook';

type TWhereClause = {
  date: {
    $gte: string;
    $lte: string;
  },
  customerId?: {
    $in?: number[];
    $notIn?: number[];
  }
};

/**
 * Gets registrations for multiple customers at once, for a given time period (start - end)
 *
 * Before-hook for: FIND
 *
 * @return {any}
 */
export default function (): Hook {

  return async (hook: HookContext): Promise<any> => {
    const startDate: string = hook.params.query['startDate'];
    const endDate: string = hook.params.query['endDate'];
    const customerIds: any = hook.params.query['customerId'];
    const excludeTestAccounts: boolean = hook.params.query['excludeTestAccounts'] === 'true';
    const inReportFormat: boolean = hook.params.query['reportFormat'] === 'true';

    const { isAdmin }: { isAdmin: boolean } = hook.params.accessTokenPayload || false;
    const where: TWhereClause = { date: { $gte: startDate, $lte: endDate } };

    if (isAdmin && excludeTestAccounts) {
      // TEMPORARY FIX: hook.params.skipGetAsRichObjectHook is used to skip the get-as-rich-object hook which currently breaks the code for some registrations.
      // Furthermore, the get-as-rich-object hook appends data which is not necessary for this single scenario.
      hook.params.skipGetAsRichObjectHook = true;
      // If the user is an admin and excludeTestAccounts is true, get registrations from all accounts except the test/demo accounts that don't have accurate data
      const excludedTestAccounts: number[] = [
        1, 6628, 14717, 16841, 26136, 26250, 29584, 31204, 32431, 33588, 33594, 33871, 33885, 34000, 35304, 36053,
        36069, 36075, 36100, 36282, 36452, 36501, 36503, 36742, 36841, 36878, 37286, 37312, 37313, 38038, 38136,
        38200, 38220, 38232, 38648, 38828, 38837, 39295, 39316, 39619, 39823, 39825, 39898, 40475
      ];

      where.customerId = {
        $notIn: excludedTestAccounts
      };
    }

    if (customerIds) {
      // quickest hack-around to support populate-user-and-customer setting the customerId as string (from token)
      if (typeof customerIds === 'string') {
        where.customerId = {
          $in: customerIds.split(',').map(Number)
        };
      } else {
        where.customerId = customerIds;
      }
    }

    /*
     * Since this hook uses sequelize core functions (Model.findAll) we need to manually
     * indicate sequelize whether or not we want to get soft-deleted data, through "paranoid" param
     *
     * `paranoid = false` means soft-deleted data will be returned
     */
    const paranoid = !(hook.params.sequelize && !hook.params.sequelize.paranoid);

    try {
      const sequelize = hook.app.get('sequelize');

      const queryOptions: any = {
        where: where,
        // optimize by skipping model instantiation
        raw: true,
        // raw: true returns associations with dot notation,
        // nest: true uses dottie.js to build object notation
        nest: true,
        paranoid
      };

      const associationOptions = {
        model: sequelize.models.registration_point,
        as: 'registrationPoint',
        paranoid: false
      };

      if (inReportFormat) {
        Object.assign(queryOptions, {
          attributes: ['id', 'customerId', 'date']
        });

        Object.assign(associationOptions, {
          attributes: ['id', 'parentId', 'path', 'name', 'label']
        });
      }

      if (!hook.params.skipGetAsRichObjectHook) {
        Object.assign(queryOptions, {
          include: [associationOptions]
        });
      }

      if(!hook.params.skipGetAsRichObjectHook && !inReportFormat) {
        Object.assign(queryOptions, {
          attributes: { exclude: ['registrationPointId'] }
        });
      }

      hook.result = await sequelize.models.registration.findAll(queryOptions);

      log.debug({
        subModule, customerIds, startDate, endDate, requestId: hook.params.requestId, sessionId: hook.params.sessionId
      }, 'Returning registrations for multiple customers');

      return hook;

    } catch (err) {
      throw new errors.GeneralError('Could not get registrations for multiple customers.', {
        errorCode: 'E047',
        subModule,
        input: hook.params.query,
        errors: err,
        requestId: hook.params.requestId,
        sessionId: hook.params.sessionId
      });
    }
  };
}
