import { getTargetBuckets, TargetBucket, TargetSetting, TimeRange } from '../util/target-bucket';
import { Application, Params, Query, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';
import { avg, groupBy, sum } from '../../../util/array';
import moment from 'moment';
import { round } from '../../../util/math';
import { Moment } from 'moment';
import { REGISTRATION_DATE_FORMAT } from '../../../util/datetime';
import { FoodwastePeriod } from '../../settings/types';

export interface WasteTarget extends TargetSetting {
  amount: number;
  unit: string;
  period: FoodwastePeriod;
  amountNormalized: number;
}

export interface CustomerWasteTargetSettings {
  customerId: string;
  targets: WasteTarget[];
}

export interface WasteTotalTarget extends TargetBucket {
  targetAmount: number;
}

export interface ExpectedWasteTarget {
  customerId: string;
  targetsTotal: number;
  targets: WasteTotalTarget[];
}

export enum RESOURCE_TYPES {
  total = 'total',
  perGuest = 'perGuest',
  perGuestBaseline = 'perGuestBaseline',
  perGuestStandard = 'perGuestStandard'
}

const RESOURCE_TYPE_COLUMNS = {
  [RESOURCE_TYPES.total]: 'expectedFoodwaste',
  [RESOURCE_TYPES.perGuest]: 'expectedFoodwastePerGuest',
  [RESOURCE_TYPES.perGuestBaseline]: 'perGuestBaseline',
  [RESOURCE_TYPES.perGuestStandard]: 'perGuestStandard'
} as const;

class FoodwasteTargetService implements SetupMethod, Pick<ServiceMethods<ExpectedWasteTarget[]>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<ExpectedWasteTarget[]> {
    const { customerId, resource } = params.query;

    const targetColumn = RESOURCE_TYPE_COLUMNS[resource as RESOURCE_TYPES];

    const settings: { customerId: string, targets: string }[] = await this.sequelize.models.settings.findAll({
      raw: true,
      attributes: [
        ['customer_id', 'customerId'],
        [this.sequelize.json(`current.${targetColumn}`), 'targets']],
      where: {
        customerId,
        current: {
          [targetColumn]: {
            $and: [{
              $ne: null
            }, {
              $ne: '[]'
            }]
          }
        }
      }
    });

    const customerTargetSettings: CustomerWasteTargetSettings[] = settings.map(({ customerId, targets }) => ({
      customerId,
      targets: JSON.parse(targets)
    }));

    const targets: ExpectedWasteTarget[] = await this.getExpectedTargets(customerTargetSettings, params.query);
    const isInternalCall = !Boolean(params.provider);
    return targets.map(customerTarget => ({
      customerId: customerTarget.customerId,
      targetsTotal: isInternalCall ? customerTarget.targetsTotal : round(customerTarget.targetsTotal, 2),
      targets: customerTarget.targets.map(target => ({
        ...target,
        targetAmount: isInternalCall ? target.targetAmount : round(target.targetAmount, 2)
      }))
    }));
  }

  async getExpectedTargets(customerTargetSettings: CustomerWasteTargetSettings[], queryParams: Query): Promise<ExpectedWasteTarget[]> {
    const { customerId, date, dimension, resource } = queryParams;
    const range = { from: date.$gte, to: date.$lte };
    const expectedCustomerAmount: ExpectedWasteTarget[] = customerTargetSettings.map(customerTarget => this.getExpectedTargetInRange(customerTarget, range, resource));

    if (dimension === 'weight') {
      return expectedCustomerAmount;
    }

    // amount values are stored as grams, but costPerkg as cost/kg.
    // so need to transform to cost per gram, hence / 1000
    const medianCostByCustomer: { customerId: string, medianCost: number }[] = await this.sequelize.models.registration_point.findAll({
      raw: true,
      attributes: [
        ['customer_id', 'customerId'],
        [this.sequelize.literal('(median(cost_per_kg) / 1000)::FLOAT'), 'medianCost']
      ],
      where: {
        customerId,
        costPerkg: { $ne: null }
      },
      group: ['customerId']
    });

    // if no registration points ( = no cost_per_kg ) => no registrations either from the account,
    // so filtering out that account if it has settings
    const costGroupByCustomer = groupBy(medianCostByCustomer, 'customerId');
    return expectedCustomerAmount
      .filter(({ customerId }) => !!costGroupByCustomer[customerId])
      .map(({ customerId, targetsTotal, targets }) => {
        const costModifier = costGroupByCustomer[customerId][0].medianCost;
        const targetsWithCost: WasteTotalTarget[] = targets.map(target => ({
          ...target,
          targetAmount: target.targetAmount * costModifier
        }));
        const totalWithCost: number = sum(targetsWithCost.map(target => target.targetAmount));
        return {
          customerId,
          targets: targetsWithCost,
          targetsTotal: totalWithCost
        };
      });

  }

  getExpectedTargetInRange(customerSettings: CustomerWasteTargetSettings, range: TimeRange, resource: RESOURCE_TYPES): ExpectedWasteTarget {
    const { customerId, targets } = customerSettings;
    const targetsTotal: number[] = [];
    const targetBuckets: WasteTotalTarget[] = getTargetBuckets(targets, range).reduce((targetsPerPeriod, curr) => {

      const from: Moment = moment(curr.from);
      const to: Moment = moment(curr.to);
      const targetPerDay: number = curr.amountNormalized;

      if(curr.period === 'fixed') {
        targetsTotal.push(targetPerDay);
        return [...targetsPerPeriod, {
          from: from.format(REGISTRATION_DATE_FORMAT),
          to: to.format(REGISTRATION_DATE_FORMAT),
          targetAmount: targetPerDay
        }];
      }

      // includes start days with + 1
      const days: number = to.diff(from, 'days') + 1;
      const targetAmountInPeriod = days * targetPerDay;
      targetsTotal.push(targetAmountInPeriod);
      return [
        ...targetsPerPeriod,
        {
          from: from.format(REGISTRATION_DATE_FORMAT),
          to: to.format(REGISTRATION_DATE_FORMAT),
          targetAmount: targetAmountInPeriod
        }
      ];
    }, []);

    return {
      customerId,
      targets: targetBuckets,
      targetsTotal: resource === RESOURCE_TYPES.total ? sum(targetsTotal) : avg(targetsTotal)
    };
  }
}

export default FoodwasteTargetService;
