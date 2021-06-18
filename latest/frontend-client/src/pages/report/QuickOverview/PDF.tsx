import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import * as React from 'react';
import { pxToPt } from 'utils/typography';
import PDFTemplate, { styles as commonStyles } from 'report/components/PDFTemplate';
import theme from 'styles/themes/reports';
import getFormattedTimeRange from 'report/utils/getFormattedDateRange';
import createValueFormatter from 'report/utils/createValueFormatter';
import { generateListString } from 'report/utils/generatePDF';
import { Basis, ReportFilterState } from 'redux/ducks/reports-new';
import { ChartImage } from 'report/utils/getChartPNG';
import { RegistrationPointNames } from 'redux/ducks/reports-new/selectors';
import moment from 'moment';
import scale from 'static/icons/balance-scale.png';
import guests from 'static/icons/guests.png';
import calendar from 'static/icons/calendar-week.png';
import tally from 'static/icons/tally.png';
import arrowUpGreen from 'static/icons/arrow-up-green.png';
import arrowUpRed from 'static/icons/arrow-up-red.png';
import arrowDownGreen from 'static/icons/arrow-down-green.png';
import arrowDownRed from 'static/icons/arrow-down-red.png';
import { InjectedIntl } from 'react-intl';
import { MetricsResponse, PointData, SeriesResponse } from 'redux/ducks/reportData';
import { StatusMetric } from 'redux/ducks/dashboardNext';
import Arrow from 'report/components/PDFIcons/Arrow';
import Meal from 'report/components/PDFIcons/Meal';
import { formatNumber, MassUnit } from 'utils/number-format';
import {
  DASHBOARD_METRIC_INTL_KEYS,
  DEFAULT_DASHBOARD_METRIC_OPTIONS
} from 'dashboard/DashboardMetricCard';
import { parseAsPdf } from 'report/utils/htmlParser';

const styles = StyleSheet.create({
  trendTitle: {
    fontSize: pxToPt(54),
    fontWeight: 900,
    marginBottom: pxToPt(115),
    textAlign: 'center'
  },
  trendMonth: {
    fontSize: pxToPt(80),
    fontWeight: 900,
    marginBottom: pxToPt(30),
    textAlign: 'center'
  },
  monthsSection: {
    marginTop: 50
  },
  soloFactPadding: {
    padding: `${pxToPt(15)}pt ${pxToPt(70)}pt ${pxToPt(60)}pt ${pxToPt(70)}pt`
  },
  factHeadline: {
    fontSize: pxToPt(40),
    color: theme.palette.text.secondary,
    marginBottom: 0
  }
});

function getMetricStyle(metric: StatusMetric) {
  switch (metric.growth) {
    case 'positive':
      return commonStyles.progressPositive;
    case 'negative':
      return commonStyles.progressNegative;
    default:
      return commonStyles.progressNeutral;
  }
}

function getMetricIcon(metric: StatusMetric): React.ReactElement {
  const { id, growth, status } = metric;
  if (id === 'co2_waste') {
    return (
      <>
        <Text>=</Text>
        <Meal rootStyle={commonStyles.progressIcon} />
      </>
    );
  }

  if (['noTarget', 'noData', 'onTarget'].includes(growth)) {
    return;
  }

  const direction = status.value >= 0 ? 'up' : 'down';
  const pathStyle =
    growth === 'positive' ? commonStyles.progressPositiveIcon : commonStyles.progressNegativeIcon;

  return (
    <Arrow rootStyle={commonStyles.progressIcon} direction={direction} pathStyle={pathStyle} />
  );
}

function getProgressStatusKey(metric: StatusMetric): string {
  const { id, growth } = metric;
  const intlKeys = DASHBOARD_METRIC_INTL_KEYS[id];

  switch (growth) {
    case 'noData':
      return 'base.notEnoughData';
    case 'noTarget':
      return 'base.noTarget';
    default:
      return intlKeys[growth] as string;
  }
}

function createProgressBox(metric: StatusMetric, intl: InjectedIntl) {
  const {
    status: { value, unit }
  } = metric;
  const rootStyle = getMetricStyle(metric);
  const icon = getMetricIcon(metric);
  const statusIntlKey = getProgressStatusKey(metric);
  // hotfix note: the current  chosen metrics dont need to be transformed to another unit,
  // and if we introduce adaptive units (scale up to next unit if 1000 in current unit), we dont need to worry about them
  const formattedStatus = formatNumber(value, {
    precision: 0,
    unit,
    unitSpace: !!unit,
    displayUnit: !!unit,
    signDisplay: 'never',
    rounding: 'round'
  });

  return (
    <View style={{ ...commonStyles.progressBox, ...rootStyle }}>
      {icon}
      <Text style={commonStyles.progressBoxText}>
        {intl.formatHTMLMessage({ id: statusIntlKey }, { value: formattedStatus })}
      </Text>
    </View>
  );
}

function createMetricBox(metric: StatusMetric, intl: InjectedIntl) {
  const {
    id,
    point: { value, unit }
  } = metric;
  const intlKeys = DASHBOARD_METRIC_INTL_KEYS[id];
  const { as } = DEFAULT_DASHBOARD_METRIC_OPTIONS[id];
  const viewUnit = as || (unit as MassUnit);
  const formattedValue = formatNumber(value, {
    precision: 0,
    unit: viewUnit,
    unitSpace: !!viewUnit,
    displayUnit: !!viewUnit,
    rounding: 'round'
  });
  const progressBox = createProgressBox(metric, intl);

  return (
    <View key={metric.id} style={{ ...commonStyles.factWrapper, padding: 0 }}>
      <View style={{ ...commonStyles.fact, padding: commonStyles.factWrapper.padding }}>
        <Text style={commonStyles.amount}>{formattedValue}</Text>
        <Text style={{ ...commonStyles.factHeadline, ...styles.factHeadline }}>
          {parseAsPdf(intl.formatHTMLMessage({ id: intlKeys.title }), {
            sub: { fontSize: pxToPt(30) }
          })}
        </Text>
      </View>
      {progressBox}
    </View>
  );
}

interface QuickOverviewPDFProps {
  data: {
    charts: ChartImage[][];
    chartColors: string[];
    foodWasteOverview: SeriesResponse;
    trendFoodWaste: SeriesResponse;
    foodWasteMetrics: MetricsResponse;
    regFrequencyMetrics: MetricsResponse;
    filter: ReportFilterState;
    selectedRegistrationPoints: RegistrationPointNames;
    dashboardMetrics: StatusMetric[];
    intl: InjectedIntl;
  };
  basis: Basis;
}

const QuickOverviewPDF: React.FunctionComponent<QuickOverviewPDFProps> = (props) => {
  const {
    data: {
      charts,
      chartColors,
      foodWasteOverview,
      trendFoodWaste: { metrics: trendFoodWasteMetrics },
      foodWasteMetrics,
      regFrequencyMetrics,
      filter,
      selectedRegistrationPoints: { area: areas, category: categories, product: products },
      dashboardMetrics,
      intl
    },
    basis
  } = props;
  const pointFormatter = createValueFormatter(filter.dimension, basis);

  return (
    <PDFTemplate>
      <View style={commonStyles.section} fixed>
        <Text style={commonStyles.title}>{intl.messages['report.quickOverview.title']}</Text>
        <Text style={commonStyles.subTitle}>
          {intl.formatMessage(
            {
              id: 'report.pdf.intro'
            },
            {
              range: getFormattedTimeRange(filter.timeRange.from, filter.timeRange.to),
              areas:
                areas.length > 0
                  ? generateListString(areas)
                  : intl.messages['report.filter.no_selection'],
              categories:
                categories.length > 0
                  ? generateListString(categories)
                  : intl.messages['report.filter.no_selection'],
              products:
                products.length > 0
                  ? generateListString(products)
                  : intl.messages['report.filter.no_selection'],
              dimension: intl.messages[`report.dimension.${filter.dimension}`]
            }
          )}
        </Text>
      </View>
      <View style={commonStyles.facts}>
        <View style={{ ...commonStyles.factWrapper, marginBottom: 8.6 }}>
          <Text style={commonStyles.groupHeadline}>{intl.messages['report.foodwaste.title']}</Text>
          <View style={commonStyles.factsContainer}>
            {foodWasteMetrics &&
              foodWasteMetrics.metrics &&
              foodWasteMetrics.metrics.map(
                (metric) =>
                  (metric.id === 'foodwasteCurrentPeriod' ||
                    metric.id === 'foodwastePerGuestCurrentPeriod') && (
                    <View
                      key={metric.id}
                      style={{ ...commonStyles.halfWidth, ...commonStyles.fact }}
                    >
                      <Text style={{ ...commonStyles.factHeadline, ...styles.factHeadline }}>
                        {metric.id === 'foodwasteCurrentPeriod'
                          ? intl.messages['report.totalFoodwaste.title']
                          : intl.messages['report.foodwaste.perGuest.title']}
                      </Text>
                      <Image
                        src={metric.id === 'foodwasteCurrentPeriod' ? scale : guests}
                        style={commonStyles.factIcon}
                      />
                      <Text style={commonStyles.amount}>
                        {createValueFormatter(
                          filter.dimension,
                          metric.id === 'foodwasteCurrentPeriod' ? 'total' : 'per-guest'
                        ).format(metric.point as number, metric.unit)}
                      </Text>
                      <Text style={commonStyles.progress}>
                        {metric.trend !== 0 && (
                          <Image
                            src={metric.trend > 0 ? arrowUpRed : arrowDownGreen}
                            style={commonStyles.progressArrow}
                          />
                        )}
                        <Text style={commonStyles.progressText}>
                          {metric.trend === 0
                            ? intl.formatMessage({
                                id: 'report.terms.noChangeComparedToPrevPeriod'
                              })
                            : metric.trend > 0
                            ? intl.formatMessage(
                                {
                                  id: `report.quickOverview.moreFoodwaste.${
                                    filter.period || 'week'
                                  }`
                                },
                                { trend: ` ${Math.abs(metric.trend)} %` }
                              )
                            : intl.formatMessage(
                                {
                                  id: `report.quickOverview.lessFoodwaste.${
                                    filter.period || 'week'
                                  }`
                                },
                                { trend: ` ${Math.abs(metric.trend)} %` }
                              )}
                        </Text>
                      </Text>
                    </View>
                  )
              )}
          </View>
        </View>
        <View style={{ ...commonStyles.factWrapper, marginTop: 9.6 }}>
          <Text style={commonStyles.groupHeadline}>
            {intl.messages['report.registrationFrequency.title']}
          </Text>
          <View style={commonStyles.factsContainer}>
            {regFrequencyMetrics &&
              regFrequencyMetrics.metrics &&
              regFrequencyMetrics.metrics.map(
                (metric) =>
                  (metric.id === 'frequencyAvgRegistrationDaysPerWeek' ||
                    metric.id === 'frequencyAvgRegistrationsPerDay') && (
                    <View
                      key={metric.id}
                      style={{ ...commonStyles.halfWidth, ...commonStyles.fact }}
                    >
                      <Text style={{ ...commonStyles.factHeadline, ...styles.factHeadline }}>
                        {metric.id === 'frequencyAvgRegistrationDaysPerWeek'
                          ? intl.messages['report.frequency.avgRegistrationDaysPerWeek']
                          : intl.messages['report.frequency.avgRegistrationsPerDay']}
                      </Text>
                      <Image
                        src={metric.id === 'frequencyAvgRegistrationDaysPerWeek' ? calendar : tally}
                        style={commonStyles.factIcon}
                      />
                      <Text style={commonStyles.amount}>{metric.point}</Text>
                      <Text style={commonStyles.progress}>
                        {metric.trend !== 0 && (
                          <Image
                            src={metric.trend > 0 ? arrowUpGreen : arrowDownRed}
                            style={commonStyles.progressArrow}
                          />
                        )}
                        <Text style={commonStyles.progressText}>
                          {metric.id === 'frequencyAvgRegistrationDaysPerWeek'
                            ? metric.trend === 0
                              ? intl.formatMessage({
                                  id: 'report.terms.noChangeComparedToPrevPeriod'
                                })
                              : metric.trend > 0
                              ? intl.formatMessage(
                                  { id: 'report.quickOverview.moreDaysRegistered' },
                                  { trend: ` ${Math.abs(metric.trend)} %` }
                                )
                              : intl.formatMessage(
                                  { id: 'report.quickOverview.lessDaysRegistered' },
                                  { trend: ` ${Math.abs(metric.trend)} %` }
                                )
                            : metric.trend === 0
                            ? intl.formatMessage({
                                id: 'report.terms.noChangeComparedToPrevPeriod'
                              })
                            : metric.trend > 0
                            ? intl.formatMessage(
                                { id: 'report.quickOverview.moreRegistrationsPerDay' },
                                { trend: ` ${Math.abs(metric.trend)} %` }
                              )
                            : intl.formatMessage(
                                { id: 'report.quickOverview.lessRegistrationsPerDay' },
                                { trend: ` ${Math.abs(metric.trend)} %` }
                              )}
                        </Text>
                      </Text>
                    </View>
                  )
              )}
          </View>
        </View>
      </View>
      <View
        style={{
          ...commonStyles.facts,
          ...commonStyles.factsContainer,
          ...commonStyles.metricList,
          padding: 7.2,
          borderTop: 0
        }}
      >
        {dashboardMetrics.map((metric) => (
          <View key={metric.id} style={{ width: '50%', padding: 7.2 }}>
            {createMetricBox(metric, intl)}
          </View>
        ))}
      </View>
      <View style={{ ...commonStyles.sectionText, ...commonStyles.divider }} break>
        <Text style={commonStyles.sectionTitle}>{intl.messages['report.overview']}</Text>
        <Text style={commonStyles.sectionSubTitle}>
          {basis === 'per-guest'
            ? intl.messages['report.quickOverview.foodwastePerGuest.description']
            : intl.messages['report.quickOverview.totalFoodwaste.description']}
        </Text>
      </View>
      {charts.length ? (
        <>
          <View style={commonStyles.chartContainer}>
            {charts[0] &&
              charts[0][0].dataURL.map((src, index) => (
                <Image key={`charts[0]_${index}`} src={src} />
              ))}
          </View>
          <View style={commonStyles.barChartsContainer}>
            {charts[2] &&
              charts[2].map((barChart, i) => {
                const barChartData = foodWasteOverview.series[0].series[i];
                return (
                  <React.Fragment key={`barchart_${i}`}>
                    <View style={commonStyles.barChart}>
                      <View style={{ ...commonStyles.barHeader, borderColor: chartColors[i] }}>
                        <Text style={commonStyles.barHeaderText}>{barChartData.name}</Text>
                        <Text style={commonStyles.barHeaderValue}>
                          {basis === 'per-guest'
                            ? pointFormatter.format(barChartData.aggregates.avg, barChartData.unit)
                            : pointFormatter.format(
                                barChartData.aggregates.total,
                                barChartData.unit
                              )}
                        </Text>
                      </View>
                      {barChart.dataURL.map((src, index) => (
                        <Image src={src} key={`barchart_${index}_${i}`} />
                      ))}
                    </View>
                  </React.Fragment>
                );
              })}
          </View>
        </>
      ) : null}
      <View style={{ ...commonStyles.sectionText, ...commonStyles.divider }} break>
        <Text style={commonStyles.sectionTitle}>{intl.messages['report.quickOverview.trend']}</Text>
        <Text style={commonStyles.sectionSubTitle}>
          {intl.messages['report.quickOverview.trend.description']}
        </Text>
        <View style={commonStyles.chartContainer}>
          {charts[1] &&
            charts[1][0].dataURL.map((src, index) => (
              <Image key={`charts[1]_${index}`} src={src} />
            ))}
        </View>
      </View>
      <View
        style={{ ...commonStyles.facts, ...commonStyles.factsContainer, ...styles.monthsSection }}
      >
        {trendFoodWasteMetrics.map((metric, i) => (
          <View
            key={metric.id}
            style={{
              ...commonStyles.halfWidth,
              paddingLeft: i % 2 === 1 ? 9.6 : 0,
              paddingRight: i % 2 === 0 ? 9.6 : 0
            }}
          >
            <View style={commonStyles.factWrapper}>
              <View style={{ ...commonStyles.fact }}>
                <Text style={styles.trendTitle}>
                  {['foodwasteTotalTrendBestMonth', 'foodwastePerGuestTrendBestMonth'].includes(
                    metric.id
                  )
                    ? intl.messages['report.quickOverview.trend.bestMonth']
                    : intl.messages['report.quickOverview.trend.worstMonth']}
                </Text>
                <Text style={styles.trendMonth}>
                  {moment((metric.point as PointData).label).format('MMMM YYYY') || '-'}
                </Text>
                {(metric.point as PointData).label && (
                  <Text style={commonStyles.progress}>
                    <Image
                      src={metric.trend < 0 ? arrowDownGreen : arrowUpRed}
                      style={commonStyles.progressArrow}
                    />
                    <Text style={commonStyles.progressText}>
                      {metric.trend < 0
                        ? intl.formatMessage(
                            { id: 'report.quickOverview.trend.lessFoodwaste' },
                            {
                              trend: ` ${Math.abs(metric.trend)} %`,
                              value: pointFormatter.format(
                                (metric.point as PointData).value,
                                metric.unit
                              )
                            }
                          )
                        : intl.formatMessage(
                            { id: 'report.quickOverview.trend.moreFoodwaste' },
                            {
                              trend: ` ${Math.abs(metric.trend)} %`,
                              value: pointFormatter.format(
                                (metric.point as PointData).value,
                                metric.unit
                              )
                            }
                          )}
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </PDFTemplate>
  );
};

export default QuickOverviewPDF;
