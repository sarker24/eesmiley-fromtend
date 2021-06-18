export const FoodwastePeriods = ['day', 'week', 'month', 'year', 'fixed'] as const;
// these goals have default values, customer can change them, but not remove them
export const RequiredWasteGoalKeys = ['expectedFoodwastePerGuest', 'perGuestBaseline', 'perGuestStandard'] as const;
// total foodwaste goal customer dependent, cant set default value
export const WasteGoalKeys = ['expectedFoodwaste', ...RequiredWasteGoalKeys] as const;
export type FoodwastePeriod = typeof FoodwastePeriods[number];

export interface ExpectedFoodwaste {
  amount: number;
  unit: string;
  period: FoodwastePeriod;
  amountNormalized?: number; // amount per day, used in calculations
}
