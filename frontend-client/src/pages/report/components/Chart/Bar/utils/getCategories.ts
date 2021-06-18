import { PointData, SeriesData } from 'redux/ducks/reportData';

const getCategories = (series: Array<SeriesData>): Array<string> => {
  if (series.length === 0) {
    return [];
  }

  const categories = series.flatMap((series) =>
    series.points.map((point: PointData): string => point.label)
  );
  return Array.from(new Set(categories));
};

export default getCategories;
