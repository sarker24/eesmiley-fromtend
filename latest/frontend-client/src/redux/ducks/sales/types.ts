export interface Sale extends CreateSale {
  id: string;
  customerId: string;
  userId: string;
}

export interface CreateSale {
  date: string;
  guests: number;
  income: number;
  portionPrice: number;
  portions: number;
  productionCost: number;
  productionWeight: number;
}

export interface SalesState {
  sales: Sale[];
  // mainly for tracking change, used on dashboard to refetch data if old guest registration flow is used
  lastSale?: Sale;
}

export enum SalesActionTypes {
  SUBMIT_SALES = 'esmiley/sales/SUBMIT_SALES',
  GET_SALES = 'esmiley/sales/GET_SALES'
}

type GetSalesAction = {
  type: typeof SalesActionTypes.GET_SALES;
  payload: Sale[];
};

type SubmitSaleAction = {
  type: typeof SalesActionTypes.SUBMIT_SALES;
  payload: Sale;
};

export type SalesActions = GetSalesAction | SubmitSaleAction;
