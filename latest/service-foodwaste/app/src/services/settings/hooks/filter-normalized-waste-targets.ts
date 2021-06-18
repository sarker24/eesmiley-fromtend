/**
 * After-hook for: FIND, CREATE
 *
 * Prerequisite:
 * current settings has been set to hook.result
 *
 */
import { Hook, HookContext } from '@feathersjs/feathers';
import { WasteGoalKeys } from '../types';

function filterNormalizedWasteTargets(settings) {
  const cleanedGoals = {};

  WasteGoalKeys.forEach(wasteKey => {
    if (settings[wasteKey]) {
      cleanedGoals[wasteKey] = settings[wasteKey].map(({ amountNormalized: _, ...wasteSlot }) => wasteSlot);
    }
  });

  return {
    ...settings,
    ...cleanedGoals
  };

}

export default (): Hook => {
  return async (hook: HookContext) => {

    if (Array.isArray(hook.result)) {
      hook.result = hook.result.map(filterNormalizedWasteTargets);
    } else {
      hook.result = filterNormalizedWasteTargets(hook.result);
    }

    return hook;
  };
};
