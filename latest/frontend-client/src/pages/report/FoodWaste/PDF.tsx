import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import * as React from 'react';
import { pxToPt } from 'utils/typography';
import PDFTemplate, { styles as commonStyles } from 'report/components/PDFTemplate';
import theme from 'styles/themes/reports';
import { formatWeight, formatMoney } from 'utils/number-format';
import getFormattedTimeRange from 'report/utils/getFormattedDateRange';
import getFactsHeadlines from 'report/FoodWaste/utils/getFactsHeadlines';
import createValueFormatter from 'report/utils/createValueFormatter';
import { generateListString } from 'report/utils/generatePDF';
import { Basis, Dimension, ReportFilterState } from 'redux/ducks/reports-new';
import { ChartImage } from 'report/utils/getChartPNG';
import { RegistrationPointNames } from 'redux/ducks/reports-new/selectors';

import scale from 'static/icons/balance-scale.png';
import arrowUpRed from 'static/icons/arrow-up-red.png';
import arrowDownGreen from 'static/icons/arrow-down-green.png';
import { MetricsResponse, SeriesResponse } from 'redux/ducks/reportData';
import { InjectedIntl } from 'react-intl';

const styles = StyleSheet.create({
  statusContainer: {
    marginTop: 13
  },
  headlineIcon: {
    width: pxToPt(68),
    height: pxToPt(54)
  },
  progress: {
    fontSize: pxToPt(40),
    color: theme.palette.text.secondary,
    fontWeight: 900,
    marginTop: pxToPt(50)
  },
  progressText: {
    color: theme.palette.text.secondary,
    fontWeight: 400
  }
});

interface FoodWastePDFProps {
  data: {
    charts: ChartImage[][];
    chartColors: string[];
    foodWasteStatus: SeriesResponse;
    foodWasteMetrics: MetricsResponse;
    foodWasteOverview: SeriesResponse;
    filter: ReportFilterState;
    selectedRegistrationPoints: RegistrationPointNames;
    intl: InjectedIntl;
  };
  basis: Basis;
  dimension: Dimension;
}

const FoodWastePDF: React.FunctionComponent<FoodWastePDFProps> = (props) => {
  const {
    data: {
      charts,
      chartColors,
      foodWasteStatus: { metrics: statusMetrics = [], extra: { target } = { target: null } },
      foodWasteMetrics: { metrics: foodWasteMetrics = [] },
      foodWasteOverview,
      filter,
      selectedRegistrationPoints: { area: areas, category: categories, product: products },
      intl
    },
    basis,
    dimension
  } = props;
  const pointFormatter = createValueFormatter(filter.dimension, basis);

  return (
    <PDFTemplate>
      <View style={commonStyles.section} fixed>
        <Text style={commonStyles.title}>
          {basis === 'per-guest'
            ? intl.messages['report.foodwaste.perGuest.title']
            : intl.messages['report.foodwaste.title']}
        </Text>
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
      <View style={{ ...commonStyles.facts, ...commonStyles.factsContainer }}>
        {foodWasteMetrics.map((metric, i) => (
          <View
            key={metric.id}
            style={{
              ...commonStyles.halfWidth,
              paddingLeft: i % 2 === 1 ? 9.6 : 0,
              paddingRight: i % 2 === 0 ? 9.6 : 0
            }}
          >
            <View
              style={{
                ...commonStyles.factWrapper,
                marginBottom: i < 2 && foodWasteMetrics.length > 2 ? 19.2 : 0
              }}
            >
              <View style={commonStyles.fact}>
                <Text style={commonStyles.factHeadline}>{getFactsHeadlines(intl)[metric.id]}</Text>
                <Text style={commonStyles.amount}>
                  {dimension === 'cost'
                    ? formatMoney(metric.point as number).toString()
                    : basis === 'per-guest'
                    ? formatWeight(metric.point as number, true, 'g')
                    : formatWeight(metric.point as number)}
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
                      ? metric.id !== 'foodwasteCurrentPeriod' &&
                        metric.id !== 'foodwastePerGuestCurrentPeriod'
                        ? intl.formatMessage({
                            id: 'report.terms.noChangeComparedToSelectedPeriod'
                          })
                        : intl.formatMessage({ id: 'report.terms.noChangeComparedToPrevPeriod' })
                      : intl.formatMessage(
                          {
                            id:
                              metric.id === 'foodwasteCurrentPeriod' ||
                              metric.id === 'foodwastePerGuestCurrentPeriod'
                                ? `report.quickOverview.${
                                    metric.trend > 0 ? 'more' : 'less'
                                  }Foodwaste.${filter.period || 'week'}`
                                : `report.foodwaste.${
                                    metric.trend > 0 ? 'more' : 'less'
                                  }FoodwasteThisPeriod`
                          },
                          {
                            trend: ` ${Math.abs(metric.trend)} %`
                          }
                        )}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      <View style={{ ...commonStyles.sectionText, ...styles.statusContainer }}>
        <Text style={commonStyles.sectionTitle}>
          <Image src={scale} style={styles.headlineIcon} />
          <Text> </Text>
          {intl.messages['report.foodwaste.recentHistory.title']}
        </Text>
        <Text style={commonStyles.sectionSubTitle}>
          {intl.formatMessage(
            {
              id:
                basis === 'per-guest'
                  ? 'report.foodwaste.recentHistory.perGuest.subtitle'
                  : 'report.foodwaste.recentHistory.total.subtitle'
            },
            {
              range: getFormattedTimeRange(filter.timeRange.from, filter.timeRange.to),
              period: filter.period
            }
          )}
        </Text>
        {statusMetrics && statusMetrics[0] && (
          <Text style={styles.progress}>
            {statusMetrics[0].trend !== 0 && (
              <Image
                src={statusMetrics[0].trend > 0 ? arrowUpRed : arrowDownGreen}
                style={commonStyles.progressArrow}
              />
            )}
            <Text> {Math.abs(statusMetrics[0].trend)} % </Text>
            {statusMetrics[0].trend !== 0 && (
              <Text style={commonStyles.progressText}>
                {intl.formatMessage(
                  {
                    id: `report.foodwaste.status.trend.${
                      statusMetrics[0].trend > 0 ? 'more' : 'less'
                    }FoodWaste`
                  },
                  {
                    target:
                      dimension === 'cost'
                        ? formatMoney(target).toString()
                        : basis === 'per-guest'
                        ? formatWeight(target, true, 'g')
                        : formatWeight(target)
                  }
                )}
              </Text>
            )}
          </Text>
        )}
      </View>
      <View>
        {charts[0] &&
          charts[0][0].dataURL.map((src, index) => <Image key={`charts[0]_${index}`} src={src} />)}
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
            {charts[1] &&
              charts[1][0].dataURL.map((src, index) => (
                <Image key={`charts[1]_${index}`} src={src} />
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
                        <Image key={`barchart_${i}_${index}`} src={src} />
                      ))}
                    </View>
                  </React.Fragment>
                );
              })}
          </View>
        </>
      ) : null}
    </PDFTemplate>
  );
};

export default FoodWastePDF;
