import { Image, Text, View } from '@react-pdf/renderer';
import * as React from 'react';
import PDFTemplate, { styles as commonStyles } from 'report/components/PDFTemplate';
import getFormattedTimeRange from 'report/utils/getFormattedDateRange';
import { ChartImage } from 'report/utils/getChartPNG';

import arrowUpGreen from 'static/icons/arrow-up-green.png';
import arrowDownRed from 'static/icons/arrow-down-red.png';
import { InjectedIntl } from 'react-intl';
import { MetricsResponse } from 'redux/ducks/reportData';

interface RegistrationFrequencyPDFProps {
  data: {
    charts: ChartImage[][];
    regFrequencyMetrics: MetricsResponse;
    startDate: string;
    endDate: string;
    intl: InjectedIntl;
  };
}

const RegistrationFrequencyPDF: React.FunctionComponent<RegistrationFrequencyPDFProps> = (
  props
) => {
  const {
    data: {
      charts,
      regFrequencyMetrics: { metrics: regFrequencyMetrics = [] },
      intl,
      startDate,
      endDate
    }
  } = props;

  return (
    <PDFTemplate>
      <View style={commonStyles.section} fixed>
        <Text style={commonStyles.title}>
          {intl.messages['report.registrationFrequency.title']}
        </Text>
        <Text style={commonStyles.subTitle}>
          {intl.formatMessage(
            { id: 'report.frequency.pdf.intro' },
            {
              range: getFormattedTimeRange(startDate, endDate)
            }
          )}
        </Text>
      </View>
      <View style={{ ...commonStyles.facts, ...commonStyles.factsContainer }}>
        {regFrequencyMetrics.map(
          (metric, i) =>
            (metric.id === 'frequencyAvgRegistrationDaysPerWeek' ||
              metric.id === 'frequencyAvgRegistrationsPerDay') && (
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
                    marginBottom: i < 2 && regFrequencyMetrics.length > 2 ? 19.2 : 0
                  }}
                >
                  <View style={commonStyles.fact}>
                    <Text style={commonStyles.factHeadline}>
                      {metric.id === 'frequencyAvgRegistrationDaysPerWeek'
                        ? intl.messages['report.frequency.avgRegistrationDaysPerWeek']
                        : intl.messages['report.frequency.avgRegistrationsPerDay']}
                    </Text>
                    <Text style={commonStyles.amount}>{metric.point}</Text>
                    <Text style={commonStyles.progress}>
                      {metric.trend !== 0 && (
                        <Image
                          src={metric.trend > 0 ? arrowUpGreen : arrowDownRed}
                          style={commonStyles.progressArrow}
                        />
                      )}
                      <Text style={commonStyles.progressText}>
                        {metric.trend === 0
                          ? intl.formatMessage({ id: 'report.terms.noChangeComparedToPrevPeriod' })
                          : metric.id === 'frequencyAvgRegistrationDaysPerWeek'
                          ? intl.formatMessage(
                              {
                                id: `report.quickOverview.${
                                  metric.trend > 0 ? 'more' : 'less'
                                }DaysRegistered`
                              },
                              {
                                trend: metric.trend
                              }
                            )
                          : intl.formatMessage(
                              {
                                id: `report.quickOverview.${
                                  metric.trend > 0 ? 'more' : 'less'
                                }RegistrationsPerDay`
                              },
                              {
                                trend: metric.trend
                              }
                            )}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            )
        )}
      </View>
      <View style={commonStyles.sectionText}>
        <Text style={commonStyles.sectionTitle}>
          {intl.messages['report.frequency.avgRegistrationsPerDay']}
        </Text>
      </View>
      <View style={commonStyles.chartContainer}>
        {charts[0] &&
          charts[0][0].dataURL.map((src, index) => <Image key={`charts[0]_${index}`} src={src} />)}
      </View>
      <View style={{ ...commonStyles.sectionText, ...commonStyles.divider }} break>
        <Text style={commonStyles.sectionTitle}>
          {intl.messages['report.frequency.registrationsPerAccount.title']}
        </Text>
      </View>
      <View>
        {charts[1] &&
          charts[1][0].dataURL.map((src, index) => <Image key={`charts[1]_${index}`} src={src} />)}
      </View>
    </PDFTemplate>
  );
};

export default RegistrationFrequencyPDF;
