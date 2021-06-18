import { SeriesData } from 'redux/ducks/reportData';

const getNumberOfBars = (data: Array<SeriesData>): number => {
  const getSum = (total: number, obj: SeriesData): number => {
    return total + obj.points.length;
  };

  return data.reduce(getSum, 0);
};

export default getNumberOfBars;
