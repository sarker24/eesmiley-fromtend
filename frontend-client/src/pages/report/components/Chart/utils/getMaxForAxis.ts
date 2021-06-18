import { transpose } from 'utils/math';
import { PointData, SeriesData } from 'redux/ducks/reportData';

const getMaxForAxis = (
  chartData: Array<SeriesData>,
  target: number,
  isStackedSeries?: boolean
): number => {
  const transposedData: Array<Array<PointData>> = transpose<PointData>(
    chartData.map((series: SeriesData): Array<PointData> => series.points)
  );
  const maxPointValue: number = Math.max(
    ...[].concat(
      ...chartData.map(
        (series: SeriesData): Array<number> => {
          return isStackedSeries
            ? transposedData.map((stackedSeries) =>
                stackedSeries.reduce((total, obj) => {
                  return total + (obj ? obj.value : 0);
                }, 0)
              )
            : series.points.map((point: PointData): number => point.value);
        }
      )
    )
  );

  return target > maxPointValue ? target : maxPointValue;
};

export default getMaxForAxis;
