import { createSelectorCreator, defaultMemoize } from 'reselect';
import { formatMoney, formatWeight } from 'utils/number-format';
import { getAvailableAccounts } from 'redux/ducks/reports-new/selectors';
import isEqual from 'lodash/isEqual';
import { RootState } from 'redux/rootReducer';

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export interface AdvancedReportSalesData {
  date: string;
  account: string;
  guests: number;
  portions: number;
  income: string;
  // below formatted strings
  foodwasteAmount: string;
  foodwasteCost: string;
  foodwasteCostPerGuest: string;
  foodwasteAmountPerGuest: string;
  foodwasteCostPerPortion: string;
  foodwasteAmountPerPortion: string;
  incomePerGuest: string;
  incomePerPortion: string;
}

export const getSalesRegistrations = createDeepEqualSelector(
  (state: RootState) => state.reportData.salesRegistrations,
  (state: RootState) => ({ currency: state.settings.currency, locale: state.ui.locale }),
  getAvailableAccounts,
  (registrations, settings, accounts): AdvancedReportSalesData[] => {
    return registrations.data.map((r) => ({
      date: r.date,
      account: accounts.find((account) => account.id === r.customerId).name,
      guests: r.guests,
      portions: r.portions,
      income: formatMoney(r.income).toString(),
      foodwasteAmount: formatWeight(r.foodwasteAmount, false, 'kg'),
      foodwasteCost: formatMoney(r.foodwasteCost).toString(),
      foodwasteCostPerGuest: formatMoney(r.foodwasteCostPerGuest).toString(),
      foodwasteAmountPerGuest: formatWeight(r.foodwasteAmountPerGuest, false, 'kg'),
      foodwasteCostPerPortion: formatMoney(r.foodwasteCostPerPortion).toString(),
      foodwasteAmountPerPortion: formatWeight(r.foodwasteAmountPerPortion, false, 'kg'),
      incomePerGuest: formatMoney(r.incomePerGuest).toString(),
      incomePerPortion: formatMoney(r.incomePerPortion).toString()
    }));
  }
);
