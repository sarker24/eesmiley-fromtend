import { Point } from 'highcharts';
import { SeriesData } from 'redux/ducks/reportData';
import { Formatter } from 'report/utils/createValueFormatter';

const getCustomDataLabel = (
  point: Point,
  exactValues: SeriesData,
  formatter?: Formatter
): string => {
  const { name, x, y } = point;
  const formattedPercentage = `${y} %`;

  // Currently the exact values are shown on the Accounts page only
  if (formatter) {
    const matchedPoint = exactValues && exactValues.points && exactValues.points[x];
    const value = (matchedPoint && matchedPoint.value) || 0;
    const formattedValue: string = formatter.format(value, exactValues.unit);

    return (
      '<div style="display: flex">' +
      ' <span style="font-weight: 900">' +
      name +
      '</span>' +
      ' <div style="display: flex; flex-direction: column; align-items: flex-end">' +
      '   <span>' +
      formattedPercentage +
      '</span>' +
      '   <span>' +
      formattedValue +
      '</span>' +
      ' </div>' +
      '</div>'
    );
  } else {
    return name + ' ' + formattedPercentage;
  }
};

export default getCustomDataLabel;
