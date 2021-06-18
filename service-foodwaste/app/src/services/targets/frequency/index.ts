import { Application, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
import { Sequelize } from 'sequelize';

import moment from 'moment';
import { Moment } from 'moment';
import 'moment-weekday-calc';
import { getTargetBuckets, TargetSetting, TargetBucket, TimeRange } from '../util/target-bucket';
import { sum } from '../../../util/array';

type MomentWithDow = Moment & { weekdayCalc: any };
type TargetDayCount = { [index: number]: number };
type TargetDaysBucket = TargetBucket & { targetDOWs: TargetDayCount[] };

export interface FrequencyTarget extends TargetSetting {
  days: number[];
}

export interface CustomerFrequencyTarget {
  customerId: string;
  targets: FrequencyTarget[];
}

export interface ExpectedFrequencyTarget {
  customerId: string;
  targetsTotal: number;
  targets: TargetDaysBucket[];
}

class FrequencyTargetService implements SetupMethod, Pick<ServiceMethods<ExpectedFrequencyTarget[]>, 'find'> {
  app: Application;
  sequelize: Sequelize;

  async setup(app: Application, path: string) {
    this.app = app;
    this.sequelize = app.get('sequelize');
  }

  async find(params: Params): Promise<ExpectedFrequencyTarget[]> {
    const { customerId, date } = params.query;
    const customerTargetSettings: CustomerFrequencyTarget[] = await this.sequelize.models.settings.findAll({
      raw: true,
      attributes: [
        'customerId',
        [this.sequelize.literal('current->\'expectedFrequency\''), 'targets']],
      where: {
        customerId,
        current: {
          expectedFrequency: {
            $and: [{
              $ne: null
            }, {
              $ne: '[]'
            }]
          }
        }
      }
    });

    return customerTargetSettings.map(customerTarget => this.getTargetNumOfDaysBuckets(customerTarget, {
      from: date.$gte,
      to: date.$lte
    }));
  }

  getTargetNumOfDaysBuckets(targetSettings: CustomerFrequencyTarget, range: TimeRange): ExpectedFrequencyTarget {
    const { customerId, targets } = targetSettings;
    let totalDOWs = 0;
    const targetBuckets = getTargetBuckets(targets, range).reduce((dayCountsByPeriod, curr) => {
      const from = moment(curr.from);
      const to = moment(curr.to);
      const targetDOWs: TargetDayCount = curr.days.reduce((dowCounts, dow) => ({
        ...dowCounts,
        [dow]: (moment() as MomentWithDow).weekdayCalc(from, to, [dow])
      }), {});

      const targetDOWsInPeriod = { from: curr.from, to: curr.to, targetDOWs };
      totalDOWs += sum(Object.keys(targetDOWs).map(key => targetDOWs[key]));
      return [
        ...dayCountsByPeriod,
        targetDOWsInPeriod
      ];
    }, []);

    return {
      customerId,
      targets: targetBuckets,
      targetsTotal: totalDOWs
    };
  }

}

export default FrequencyTargetService;
