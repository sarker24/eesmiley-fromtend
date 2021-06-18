import { InjectedIntl } from 'react-intl';

import overviewImage from 'static/img/report-quick-overview.svg';
import accountsImage from 'static/img/report-accounts.svg';
import foodwasteImage from 'static/img/report-total-foodwaste.svg';
import perGuestImage from 'static/img/report-per-guest.svg';
import trendImage from 'static/img/report-trend.svg';
import frequencyImage from 'static/img/report-frequency.svg';
import downloadImage from 'static/img/download.svg';

const getReportPages = (
  intl: InjectedIntl
): {
  title: string;
  link?: string;
  divider?: boolean;
  isStartPage?: boolean;
  cardSubheader?: string;
  cardGraphic?: string;
  disabled?: true;
}[] => [
  {
    title: intl.messages['report.navigation.startpage'],
    link: '/report/',
    divider: true,
    isStartPage: true
  },
  {
    title: intl.messages['report.quickOverview.title'],
    link: '/report/quick-overview',
    cardSubheader: intl.messages['report.startpage.quickOverview.description'],
    cardGraphic: overviewImage
  },
  {
    title: intl.messages['report.accounts.title'],
    link: '/report/accounts',
    cardSubheader: intl.messages['report.startpage.accounts.description'],
    cardGraphic: accountsImage
  },
  {
    title: intl.messages['report.totalFoodwaste.title'],
    link: '/report/foodwaste',
    cardSubheader: intl.messages['report.startpage.totalFoodwaste.description'],
    cardGraphic: foodwasteImage
  },
  {
    title: intl.messages['report.foodwaste.perGuest.title'],
    link: '/report/foodwaste/per-guest',
    cardSubheader: intl.messages['report.startpage.foodwastePerGuest.description'],
    cardGraphic: perGuestImage
  },
  {
    title: intl.messages['report.registrationFrequency.title'],
    link: '/report/frequency',
    cardSubheader: intl.messages['report.startpage.registrationFrequency.description'],
    cardGraphic: frequencyImage
  },
  {
    title: intl.messages['report.advancedReports.title'],
    cardGraphic: downloadImage,
    link: '/report/advanced'
  },
  {
    title: intl.messages['report.trendAnalysis.title'],
    cardSubheader: intl.messages['report.startpage.trendAnalysis.description'],
    cardGraphic: trendImage,
    disabled: true
  },
  {
    title: intl.messages['projects'],
    cardSubheader: intl.messages['report.startpage.projects.description'],
    cardGraphic: downloadImage,
    disabled: true
  }
];

export default getReportPages;
