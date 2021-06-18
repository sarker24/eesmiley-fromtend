import getChartPNG, { ChartImage } from 'report/utils/getChartPNG';
import { ChartRefs } from 'redux/ducks/charts';
import { ReportFilterState } from 'redux/ducks/reports-new';

export type GetChartPNGsProps = {
  chartRefs: ChartRefs;
  filter: ReportFilterState;
};

export function getChartPNGs(props: GetChartPNGsProps): Promise<ChartImage[][]> {
  const {
    chartRefs,
    filter: { basis }
  } = props;
  return Promise.all<ChartImage[]>([
    getChartPNG({
      chartRefs,
      type: 'bar',
      sourceWidth: 900
    }),
    getChartPNG(
      basis === 'per-guest'
        ? {
            chartRefs,
            type: 'column',
            sourceWidth: 800
          }
        : {
            chartRefs,
            type: 'donut',
            sourceWidth: 850,
            options: {
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
          }
    ),
    getChartPNG({
      chartRefs,
      type: 'barGroup',
      imageWidth: 2480 / 3, //2480 is the A4 width at 300DPI
      sourceWidth: 250
    })
  ]);
}
