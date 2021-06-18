import { PointData, SeriesData } from 'redux/ducks/reportData';

const concatenateArrayValues = (series: (SeriesData | SeriesData[])[]): number[] => {
  return ([] as number[]).concat(
    ...series.map(
      (child: Array<SeriesData> | SeriesData): Array<number> => {
        if (Array.isArray(child)) {
          return concatenateArrayValues(child);
        } else if (child.points) {
          return child.points.map((point: PointData): number => point.value);
        }
      }
    )
  );
};

export default concatenateArrayValues;
