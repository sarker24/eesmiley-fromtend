import getChartPNG, { ChartImage } from 'report/utils/getChartPNG';
import { avg, sum } from 'utils/array';
import { ReportFilterState } from 'redux/ducks/reports-new';
import { ChartRefs } from 'redux/ducks/charts';
import { SeriesResponse } from 'redux/ducks/reportData';
import Highcharts, { Chart } from 'highcharts';

export type GetChartPNGsProps = {
  chartRefs: ChartRefs;
  chartsData: SeriesResponse;
  filter: ReportFilterState;
};

export function getChartPNGs(props: GetChartPNGsProps): Promise<ChartImage[][]> {
  const {
    chartRefs,
    chartsData,
    filter: { basis }
  } = props;
  return Promise.all<ChartImage[]>([
    getChartPNG({
      chartRefs,
      type: 'bar',
      sourceWidth: 900,
      maxHeight: 2700
    }),
    getChartPNG({
      chartRefs,
      type: basis === 'per-guest' ? 'column' : 'donut',
      sourceWidth: basis === 'per-guest' ? 800 : 850,
      options:
        basis === 'per-guest'
          ? undefined
          : {
              title: {
                style: {
                  fontSize: '23px'
                }
              },
              plotOptions: {
                pie: {
                  dataLabels: {
                    y: 10
                  }
                }
              }
            }
    }),
    getChartPNG({
      chartRefs,
      type: 'barGroup',
      imageWidth: 2480 / 3, //2480 is the A4 width at 300DPI
      sourceWidth: 250,
      metadataGen: (chart: Chart) => {
        const areaGroupSeries = chartsData.series.find(
          (chartData) => chartData.id === 'areaGroups'
        );
        const areaSeries = areaGroupSeries.series.flatMap((series) => series.series);
        // we have dummy empty series so that charts have correct colors (need to fix later)
        const currentAreaSeries = chart.options.series.filter(
          (series: Highcharts.SeriesBarOptions) => series.data.length > 0
        );
        const currentAreaName = currentAreaSeries[0].name;
        const currentAreaData = areaSeries.filter((series) => series.name === currentAreaName);
        const average = avg(currentAreaData.map((series) => series.aggregates.avg));
        const total = sum(currentAreaData.map((series) => series.aggregates.total));

        return {
          total: basis === 'per-guest' ? average : total,
          name: currentAreaName,
          unit: currentAreaData[0].unit
        };
      }
    })
  ]);
}
