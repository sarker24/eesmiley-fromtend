import getNumberOfBars from './getNumberOfBars';
import { barHeight, spaceBetweenGroupedBars, spaceBetweenSingleBars } from '../options';
import { SeriesData } from 'redux/ducks/reportData';

interface FunctionProps {
  series: Array<SeriesData>;
  marginTop: number;
  marginBottom: number;
  isStackedSeries?: boolean;
  barBorderWidth?: number;
  extraSpacing?: number;
  minHeight?: number;
}

const calculateChartHeight = ({
  series,
  marginTop,
  marginBottom,
  isStackedSeries = false,
  barBorderWidth = 0,
  extraSpacing = 0,
  minHeight
}: FunctionProps): number => {
  const maxNumberOfPoints = series.length * Math.max(...series.map((s) => s.points.length));
  const numberOfBars: number = isStackedSeries
    ? getNumberOfBars(series) / series.length
    : maxNumberOfPoints;
  const isSingleSeries: boolean = series.length === 1;
  const spaceBetweenBars: number =
    isSingleSeries || isStackedSeries
      ? numberOfBars * spaceBetweenSingleBars
      : (numberOfBars / series.length) * spaceBetweenGroupedBars;
  const chartHeight: number =
    numberOfBars * (barHeight + barBorderWidth * 2 + extraSpacing) +
    spaceBetweenBars +
    marginBottom +
    marginTop;

  return Boolean(minHeight) && chartHeight < minHeight ? minHeight : chartHeight;
};

export default calculateChartHeight;
