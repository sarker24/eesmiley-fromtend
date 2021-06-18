import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import * as React from 'react';
import theme from 'styles/themes/reports';
import { pxToPt } from 'utils/typography';
import PDFTemplate, { styles as commonStyles } from 'report/components/PDFTemplate';
import getFormattedTimeRange from 'report/utils/getFormattedDateRange';
import createValueFormatter from 'report/utils/createValueFormatter';
import { generateListString } from 'report/utils/generatePDF';
import { Basis, ReportFilterState } from 'redux/ducks/reports-new';
import { ChartImage } from 'report/utils/getChartPNG';
import { AccountPointFilterWithNames } from 'redux/ducks/reports-new/selectors';
import { SeriesResponse } from 'redux/ducks/reportData';
import { InjectedIntl } from 'react-intl';

const styles = StyleSheet.create({
  totalContainer: {
    textAlign: 'center'
  },
  total: {
    fontSize: pxToPt(54),
    fontWeight: 900,
    color: theme.palette.text.primary
  },
  totalText: {
    fontSize: pxToPt(40),
    color: theme.palette.text.secondary
  }
});

interface AccountsPDFProps {
  data: {
    charts: ChartImage<{ total: number; name: string; unit: string }>[][];
    chartsData: SeriesResponse;
    chartColors: string[];
    reportFilter: ReportFilterState;
    accountPointFilters: AccountPointFilterWithNames[];
    intl: InjectedIntl;
  };
  basis: Basis;
}

const AccountsPDF: React.FunctionComponent<AccountsPDFProps> = (props) => {
  const {
    data: { charts, chartsData, chartColors, reportFilter, accountPointFilters, intl },
    basis
  } = props;

  const foodWastePerAccountFilter =
    chartsData &&
    chartsData.series &&
    chartsData.series.find((series) => series.id === 'groupTotalSeries');
  const exactFoodWastePerAccountFilter =
    foodWastePerAccountFilter &&
    foodWastePerAccountFilter.series &&
    foodWastePerAccountFilter.series.find((series) => series.id === 'totalAmountSeries');
  const otherPoint =
    exactFoodWastePerAccountFilter &&
    exactFoodWastePerAccountFilter.points &&
    exactFoodWastePerAccountFilter.points.find((point) => point.label.toLowerCase() === 'other');
  const foodWasteInOtherAccounts = otherPoint && otherPoint.value;
  const foodWasteInSelectedAccounts =
    exactFoodWastePerAccountFilter.aggregates.total - foodWasteInOtherAccounts;
  const unit = exactFoodWastePerAccountFilter.unit;
  const pointFormatter = createValueFormatter(reportFilter.dimension, basis);
  // quickfix, we probably want to separate each group later on
  const selectedAreas = accountPointFilters.flatMap(
    (filter) => filter.selectedRegistrationPoints.area
  );
  const selectedCategories = accountPointFilters.flatMap(
    (filter) => filter.selectedRegistrationPoints.category
  );
  const selectedProducts = accountPointFilters.flatMap(
    (filter) => filter.selectedRegistrationPoints.product
  );

  const perAccountSeries = chartsData.series.find((s) => s.id === 'perAccountGroups');
  const accountAverage = perAccountSeries ? perAccountSeries.aggregates.avg : 0;

  return (
    <PDFTemplate>
      <View style={commonStyles.section} fixed>
        <Text style={commonStyles.title}>{intl.messages['report.accounts.title']}</Text>
        <Text style={commonStyles.subTitle}>
          {intl.formatMessage(
            {
              id: 'report.pdf.intro'
            },
            {
              range: getFormattedTimeRange(reportFilter.timeRange.from, reportFilter.timeRange.to),
              areas:
                selectedAreas.length > 0
                  ? generateListString(selectedAreas)
                  : intl.messages['report.filter.no_selection'],
              categories:
                selectedCategories.length > 0
                  ? generateListString(selectedCategories)
                  : intl.messages['report.filter.no_selection'],
              products:
                selectedProducts.length > 0
                  ? generateListString(selectedProducts)
                  : intl.messages['report.filter.no_selection'],
              dimension: intl.messages[`report.dimension.${reportFilter.dimension}`]
            }
          )}
        </Text>
      </View>
      <View style={{ ...commonStyles.sectionText, ...commonStyles.divider }}>
        <Text style={commonStyles.sectionTitle}>
          {intl.messages['report.accounts.foodwastePerAccount']}
        </Text>
      </View>
      {charts.length ? (
        <>
          {charts[0][0].dataURL.map((imgSrc, idx) => (
            <View key={`acc_bars_${idx}`} break={idx > 0}>
              <Image src={imgSrc} />
            </View>
          ))}
          <View style={{ ...commonStyles.sectionText, ...commonStyles.divider }} break>
            <Text style={commonStyles.sectionTitle}>
              {intl.messages['report.accounts.foodwastePerAccount']}
            </Text>
          </View>
          <View style={commonStyles.chartContainer}>
            {charts[1] &&
              charts[1][0].dataURL.map((src, index) => (
                <Image key={`donut_chart_${index}`} src={src} />
              ))}
            <View style={styles.totalContainer}>
              <Text style={styles.total}>
                {basis === 'per-guest'
                  ? pointFormatter.format(accountAverage, unit)
                  : pointFormatter.format(foodWasteInSelectedAccounts, unit)}
              </Text>
              <Text style={styles.totalText}>
                {basis === 'per-guest'
                  ? intl.messages['report.accounts.avgFWPerGuestInSelectedAccounts']
                  : intl.messages['report.accounts.totalFoodwasteInSelectedAccounts']}
              </Text>
            </View>
          </View>
          <View style={commonStyles.barChartsContainer}>
            {charts[2] &&
              charts[2]
                .sort((a, b) => b.metadata.total - a.metadata.total)
                .map((barChart, i) => {
                  return (
                    <React.Fragment key={`barchart ${i}`}>
                      <View style={commonStyles.barChart}>
                        <View style={{ ...commonStyles.barHeader, borderColor: chartColors[0] }}>
                          <Text style={commonStyles.barHeaderText}>{barChart.metadata.name}</Text>
                          <Text style={commonStyles.barHeaderValue}>
                            {pointFormatter.format(barChart.metadata.total, barChart.metadata.unit)}
                          </Text>
                        </View>
                        {barChart.dataURL.map((imgSrc, idx) => (
                          <Image src={imgSrc} key={`barchart_${i}${idx}`} />
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

export default AccountsPDF;
