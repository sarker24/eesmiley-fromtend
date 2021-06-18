import { InjectedIntl } from 'react-intl';

const getFactsHeadlines = (intl: InjectedIntl) => ({
  foodwasteCurrentPeriod: intl.messages['report.metric.total'],
  foodwasteBestPeriod: intl.messages['report.metric.bestPeriod'],
  foodwasteWorstPeriod: intl.messages['report.metric.worstPeriod'],
  foodwasteAveragePeriod: intl.messages['report.metric.average'],
  foodwastePerGuestCurrentPeriod: intl.messages['report.metric.total'],
  foodwastePerGuestBestPeriod: intl.messages['report.metric.bestPeriod'],
  foodwastePerGuestWorstPeriod: intl.messages['report.metric.worstPeriod'],
  foodwastePerGuestAveragePeriod: intl.messages['report.metric.average']
});

export default getFactsHeadlines;
