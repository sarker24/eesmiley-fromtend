import { PointOptionsObject, SeriesOptionsType } from 'highcharts';
import { SeriesData } from 'redux/ducks/reportData';
import { SeriesMapper } from 'report/components/Chart/utils/getChartData';

const seriesMappers: () => SeriesMapper[] = () => [
  (data) =>
    data.series.map(
      (series: SeriesData): SeriesOptionsType => ({
        type: undefined,
        data: series.points
          .filter((point) => point.value > 0)
          .map(
            (point): PointOptionsObject => ({
              y: point.value,
              name:
                point.label.toLowerCase() === 'other'
                  ? data.intl.messages['report.terms.other']
                  : point.label
            })
          ),
        name: series.name
          ? series.name.toLowerCase() === 'other'
            ? data.intl.messages['report.terms.other']
            : series.name
          : undefined
      })
    )
];

export default seriesMappers;
