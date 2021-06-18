import { createSelectorCreator, defaultMemoize } from 'reselect';
import { getRegistrations } from 'redux/ducks/data/registrations/selectors';
import { Registration } from 'redux/ducks/data/registrations';
import isEqual from 'lodash/isEqual';

export interface IRecentRegistration {
  id: string;
  date: string;
  amount: number;
  cost: number;
  createdAt: string;
  areaName: string;
  areaStatus: string;
  productName: string;
  productStatus: string;
  categoryName: string;
  categoryStatus: string;
}

// create a custom "selector creator" that uses lodash.isEqual instead of the default equality check "==="
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const getRecentRegistrations = createDeepEqualSelector(getRegistrations, (registrations) => {
  return registrations.map((registration: Registration) => {
    const { registrationPoint } = registration;
    let productStatus = 'active';

    if (!registrationPoint || registrationPoint.deletedAt) {
      productStatus = 'deleted';
    } else if (!registrationPoint.active) {
      productStatus = 'inactive';
    }

    return {
      id: registration.id,
      amount: registration.amount,
      date: registration.date,
      cost: registration.cost,
      createdAt: Date.parse(registration.createdAt),
      productName: registrationPoint ? registrationPoint.name : null,
      productStatus,
      productId: registrationPoint.id
    };
  });
});
