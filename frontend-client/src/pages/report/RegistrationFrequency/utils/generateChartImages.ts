import getChartPNG, { ChartImage } from 'report/utils/getChartPNG';
import { ChartRefs } from 'redux/ducks/charts';
import { ReportFilterState } from 'redux/ducks/reports-new';

export type GetChartPNGsProps = {
  chartRefs: ChartRefs;
  chartsData: any;
  filter: ReportFilterState;
};

export function getChartPNGs(props: GetChartPNGsProps): Promise<ChartImage[][]> {
  const { chartRefs } = props;
  return Promise.all<ChartImage[]>([
    getChartPNG({
      chartRefs,
      type: 'line',
      sourceWidth: 1000
    }),
    getChartPNG({
      chartRefs,
      type: 'bar',
      sourceWidth: 900,
      maxHeight: 3000 // by trial and error, larger height makes react-pdf to crash
    })
  ]);
}
