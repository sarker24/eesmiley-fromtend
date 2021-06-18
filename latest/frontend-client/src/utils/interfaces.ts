export interface IReportSale {
  customerId: string;
  date: string;
  guests: number | string;
  id: number | string;
  income: number | string;
  portionPrice: number | string;
  portions: number | string;
  productionCost: number | string;
  productionWeight: number | string;
  foodwasteWeight: number | string;
}
