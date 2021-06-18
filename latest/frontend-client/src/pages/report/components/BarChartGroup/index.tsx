import * as React from 'react';
import { Grid } from '@material-ui/core';
import { Bar } from 'report/components/Chart';
import ChartHeader from '../ChartHeader';
import concatenateArrayValues from 'report/components/Chart/utils/concatenateArrayValues';
import getChartData from 'report/components/Chart/utils/getChartData';
import { themeMapper } from './utils/chartMappers';
import seriesMappers from 'report/components/Chart/utils/seriesMappers';
import { SeriesData } from 'redux/ducks/reportData';
import { formatWeight, formatMoney } from 'utils/number-format';
import { sum } from 'utils/array';
import createValueFormatter from 'report/utils/createValueFormatter';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Basis, Dimension } from 'redux/ducks/reports-new';

interface BarChartGroupProps {
  chartsData: (SeriesData | SeriesData[])[];
  colors: Array<string>;
  isLoading?: boolean;
  basis: Basis;
  dimension: Dimension;
}

interface OwnProps extends BarChartGroupProps, InjectedIntlProps {}

const BarChartGroup: React.FunctionComponent<OwnProps> = ({
  isLoading,
  chartsData,
  colors,
  dimension,
  basis,
  intl
}) => {
  // note: if chartsData not array, a new array instance on every render,
  // see comment below - data should be mapped in parent
  const maxValue: number = Math.max(...concatenateArrayValues(chartsData));

  return (
    <>
      {
        // todo this needs to go to caller's chartMappers, which knows what kind of data it has
        chartsData.map(
          (data: Array<SeriesData> | SeriesData, index: number): React.ReactElement => {
            const seriesData: Array<SeriesData> = Array.isArray(data) ? data : [data];
            if (seriesData.some((data) => data.aggregates.total > 0 || data.aggregates.avg > 0)) {
              // filter empty series (name undefined), which are needed currently for keeping colors consistent (based on index),
              // which is only occurring on reports/account page after transposing series
              const nonEmptySeries: SeriesData = seriesData.find((data) => !!data.name);
              const formattedName = nonEmptySeries
                ? nonEmptySeries.name.toLowerCase() === 'other'
                  ? intl.messages['report.terms.other']
                  : nonEmptySeries.name
                : '';
              const chartColors: Array<string> = Array.isArray(data) ? colors : [colors[index]];
              const valueFormatter = createValueFormatter(dimension, basis);
              const chartOptions = getChartData(
                {
                  series: seriesData,
                  chartColors,
                  maxValue,
                  intl
                },
                seriesMappers(),
                themeMapper(valueFormatter)
              );

              const nonEmptyData = seriesData.filter((series) => series.points.length > 0);
              const formatWeightFn = (dataArr) =>
                basis === 'per-guest' ? formatWeight(dataArr, true, 'g') : formatWeight(dataArr);

              const value =
                dimension === 'cost'
                  ? formatMoney(sum(nonEmptyData.map((data) => data.aggregates.total))).toString()
                  : formatWeightFn(sum(nonEmptyData.map((data) => data.aggregates.total)));

              return (
                <Grid item xs={12} sm={6} md={6} lg={4} key={`${formattedName}-${index}`}>
                  <ChartHeader name={formattedName} value={value} color={chartColors[0]} />
                  <Bar chartOptions={chartOptions} group isLoading={isLoading} />
                </Grid>
              );
            }
          }
        )
      }
    </>
  );
};

export default injectIntl(BarChartGroup);
