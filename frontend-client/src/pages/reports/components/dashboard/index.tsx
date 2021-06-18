/*
 * Dashboard for Reports module v2
 */
import * as React from 'react';
import { IDashboard } from 'redux/ducks/reports/reducer';
import FailedPlaceholder from 'components/FailedPlaceholder';
import IFrameContainer from './../iframeContainer';
import { InjectedIntlProps, injectIntl } from 'react-intl';

export interface OwnProps {
  data: IDashboard;
  dashboardId: string;
  loadingTitle?: string;
  noDataString?: string;
}

type DashboardProps = InjectedIntlProps & OwnProps;

class Dashboard extends React.Component<DashboardProps> {

  static defaultProps = {
    data: {} as IDashboard,
    noDataString: 'report.registrations.no_data.description'
  };

  renderContent() {

    const { data, dashboardId, loadingTitle, intl, noDataString } = this.props;

    if (data.loading == false && data.success && data.url === null) {
      return (
        <FailedPlaceholder className={'empty-data'} description={intl.messages[noDataString]} title={intl.messages['no_data']}/>
      );
    }

    if (data.error) {
      return (
        <FailedPlaceholder className={'empty-data'}/>
      );
    }

    return (
      <IFrameContainer key={dashboardId} src={data.url} loadingTitle={loadingTitle} id={'reportsDashboard-' + dashboardId} />
    );
  }

  render() {

    const { children, dashboardId, data, loadingTitle, noDataString, intl,  ...rest } = this.props;

    return (
      <div className='reportsDashboard' {...rest}>
        { children }
        {
          this.renderContent()
        }
      </div>
    );
  }
}

export default injectIntl(Dashboard);
