/**
 *
 * To avoid recalculation of expected waste in day period (used in calculations),
 * adds normalized data to the given food waste goal settings (total and per guest).
 * Amount is normalized to day period.
 *
 * Before hook: CREATE/PATCH
 *
 **/
import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';
import { ExpectedFoodwaste, WasteGoalKeys } from '../types';
import { WasteTarget } from '../../targets/foodwaste/index';

const subModule: string = 'process-waste-targets';

// targets for per guest are required always
const DefaultTargets: { [key in typeof WasteGoalKeys[number]]: WasteTarget[] } = {
  perGuestStandard: [{ from: '1970-01-01', amount: 60, amountNormalized: 60, period: 'fixed', unit: 'g' }],
  perGuestBaseline: [{ from: '1970-01-01', amount: 110, amountNormalized: 110, period: 'fixed', unit: 'g' }],
  expectedFoodwastePerGuest: [{ from: '1970-01-01', amount: 80, amountNormalized: 80, period: 'fixed', unit: 'g' }],
  expectedFoodwaste: undefined
};

function getDayCoefficient(expectedWaste: ExpectedFoodwaste) {
  switch (expectedWaste.period) {
    case 'day':
      return 1;
    case 'week':
      return 7;
    case 'month':
      // fixed to 30 days as requirement (accounting practice)
      return 30;
    case 'year':
      // fixed to 360 days as requirement (accounting practice)
      return 360;
    case 'fixed':
      return 1;
    default:
      throw new Error('Invalid period');
  }
}

function getNormalizedAmountPerDay(expectedWaste: ExpectedFoodwaste) {
  return expectedWaste.amount / getDayCoefficient(expectedWaste);
}

export default (): Hook => {
  return async (hook: HookContext) => {
    const { requestId, sessionId } = hook.params;
    const settingsKey = hook.method === 'create' ? 'settings' : 'current';
    const { [settingsKey]: settingsData } = hook.data;

    try {
      WasteGoalKeys.forEach(goalKey => {
        if (settingsData[goalKey]) {
          hook.data[settingsKey][goalKey] = settingsData[goalKey].map(wasteSlot => ({
            ...wasteSlot,
            amountNormalized: getNormalizedAmountPerDay(wasteSlot)
          }));
        } else if (DefaultTargets[goalKey]) {
          hook.data[settingsKey][goalKey] = DefaultTargets[goalKey];
        }
      });

    } catch (error: unknown) {
      throw new errors.BadRequest((error as Error).message, {
        subModule,
        requestId,
        sessionId
      });
    }

    return hook;
  };
};
