import { transpose } from 'utils/math';
import { Aggregates, SeriesData } from 'redux/ducks/reportData';
import { Basis } from 'redux/ducks/reports-new';
import { avg, sum } from 'utils/array';

const getCategorisedData = (series: Array<SeriesData>, basis: Basis): Array<Array<SeriesData>> => {
  // each account point filter has areas sorted by amount => each filter result can have different order of areas
  const seriesData: SeriesData[][] = series.map((data) => data.series);
  const getTotal = (aggregates: Aggregates[]) =>
    basis === 'per-guest'
      ? avg(aggregates.map((agg) => agg.avg))
      : sum(aggregates.map((agg) => agg.total));

  const aggregatesByAreaName = seriesData
    .flatMap((series) => series)
    .reduce(
      (areas, area) => ({
        ...areas,
        [area.name]: (areas[area.name] || []).concat(area.aggregates)
      }),
      {} as { [area: string]: Aggregates[] }
    );
  const allAreaTotalsByName = Object.keys(aggregatesByAreaName).reduce(
    (areas, areaName) => ({
      ...areas,
      [areaName]: getTotal(aggregatesByAreaName[areaName])
    }),
    {}
  );

  const areaNamesSorted: string[] = Object.keys(allAreaTotalsByName).sort(
    (a, b) => allAreaTotalsByName[b] - allAreaTotalsByName[a]
  );
  const top5AreaNames: string[] = areaNamesSorted.filter((name) => name !== 'Other').slice(0, 5);
  const paddedSeriesData: SeriesData[][] = seriesData.map((seriesData0) =>
    top5AreaNames.map((name) => seriesData0.find((seriesData1) => seriesData1.name === name))
  );
  const transposed: SeriesData[][] = transpose<SeriesData>(paddedSeriesData);
  // cant filter out empty series due to colors are mapped with series index, quick fix for barchartgroup component
  return transposed.map((row) =>
    row.map((col) => (!col ? { aggregates: { total: 0, avg: 0 }, points: [] } : col))
  );
};

export default getCategorisedData;
