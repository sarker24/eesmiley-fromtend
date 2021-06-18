import { PointOptionsObject, SeriesOptionsType } from 'highcharts';
import { PointData, SeriesData } from 'redux/ducks/reportData';
import { InjectedIntl } from 'react-intl';

// todo consolidate charts, make proper chart factory, now we have series mappers all over the place
const mapDataToSeries = (
  seriesData: Array<SeriesData>,
  intl: InjectedIntl
): Array<SeriesOptionsType> => {
  return seriesData.map(
    (series: SeriesData): SeriesOptionsType => ({
      type: undefined,
      data:
        series &&
        series.points
          .filter((point) => point.value > 0)
          .map(
            (point: PointData, pointIndex): PointOptionsObject => ({
              ...point,
              name:
                point.label.toLowerCase() === 'other'
                  ? intl.messages['report.terms.other']
                  : point.label,
              y: point.value,
              // because of this assignment, the donut chart doesnt need to reset chart.colorCounter (see Bar/index.tsx fix)
              colorIndex: pointIndex
            })
          )
    })
  );
};

export default mapDataToSeries;
