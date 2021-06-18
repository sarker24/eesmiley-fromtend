import Bar from './Bar';
import Donut from './Donut';
import Line from './Line';
import Column from './Column';
import { SeriesData } from 'redux/ducks/reportData';
export interface ChartData {
  unit: string;
  average: number;
  target: number;
  total: number;
  otherAccounts?: number;
  accountFilters?: Array<SeriesData>;
  registrationPoints?: Array<SeriesData>;
  percentages?: Array<SeriesData>;
}

export { Bar, Donut, Line, Column };
