import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import Helmet from 'react-helmet';
import { setPeriodAndSearch, setFilterAndInitReports, tabMap, getReportsPath } from 'redux/ducks/reports';
import { IFilterParams, IDashboard } from 'redux/ducks/reports/reducer';
import Dashboard from './components/dashboard';
import moment from 'moment';
import TimeFilter from './components/timeFilter';
import FilterDialog from './components/filterDialog';
import { API_DATE_FORMAT, UI_DATE_FORMAT } from 'utils/datetime';
import palette from 'styles/palette';

// DEPRECATED OLD REPORTS

// Old Material UI v0
import { MuiThemeProvider as MuiThemeProviderV0 } from 'material-ui/styles';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import classnames from 'classnames';

const oldTheme = {
  datePicker: {
    selectColor: '#008b87',
    headerColor: '#008b87'
  },
  toggle: {
    trackOffColor: 'rgb(189, 189, 189)'
  },
};

interface StateProps {
  customerId: string;
  filter: IFilterParams;
  searchCriteria: any;
  dashboards: {
    registrations: IDashboard;
    projects: IDashboard;
    sales: IDashboard;
  };
  selectedDashboard: string;
  loading: boolean;
  loaded: boolean;
  initializedSettings: boolean;
}

interface DispatchProps {
  setPeriodAndSearch: any;
  setFilterAndInitReports: any;
  getReportsPath: any;
}

export interface OwnProps {
  query: Function;
  setFilterAndInitReports: Function;
}

export interface RouterParams {
  routeParams?: any;
  router?: any;
}

export interface ReportsPageState {
  initialized: boolean;
  filterShouldFloat: boolean;
  initializedRoute?: boolean;
  filterHasChanged: boolean;
  initializedWithData?: boolean;
}

require('./index.scss');

type ReportsPageProps = StateProps & DispatchProps & InjectedIntlProps & RouterParams & OwnProps;

const customThemeV0 = getMuiTheme({ ...oldTheme, palette });

class ReportsPage extends React.Component<ReportsPageProps, ReportsPageState> {

  constructor(props: ReportsPageProps) {
    super(props);
    this.state = {
      initialized: false,
      filterHasChanged: false,
      filterShouldFloat: false
    };

    this.onWindowScroll = this.onWindowScroll.bind(this);
  }

  onWindowScroll() {

    const { filterShouldFloat } = this.state;
    const heightLimit = 23;
    const scrollTop = document.getElementById('reportsPageContainer').scrollTop;

    if (filterShouldFloat) {
      if (scrollTop <= heightLimit) {
        this.setState(Object.assign({}, this.state, { filterShouldFloat: false }));
      }
    } else if (scrollTop > heightLimit) {
      this.setState(Object.assign({}, this.state, { filterShouldFloat: true }));
    }
  }

  componentDidMount() {

    document.getElementById('reportsPageContainer').addEventListener('scroll', this.onWindowScroll);
    const { routeParams, router, getReportsPath } = this.props;
    const path = getReportsPath();
    if (path != null && path != undefined && path != '' && !this.state.initializedRoute && routeParams.from == undefined && routeParams.to == undefined) {
      this.setState({
        initializedRoute: true
      });
      router.replace(path);

      return;
    }
    this.parseFilter();
  }

  componentWillUnmount() {
    if (document.getElementById('reportsPageContainer')) {
      document.getElementById('reportsPageContainer').removeEventListener('scroll', this.onWindowScroll);
    }
  }

  componentDidUpdate() {
    this.parseFilter();
  }

  parseFilter(): void {
    const { filter, initializedSettings, customerId, setFilterAndInitReports, routeParams, router } = this.props;
    /*
    * Reason for all these flags and why parser is called after didMount is that
    * redux store is not initialized (properly?) with user/settings data before first render,
    * so we wont have user data available in componentDidMount if this page is
    * reloaded / landed on first.
    *
    * */
    if (!this.state.initialized && initializedSettings && customerId) {

      let from = routeParams.from ? moment(routeParams.from, UI_DATE_FORMAT) : null;
      let to = routeParams.to ? moment(routeParams.to, UI_DATE_FORMAT) : null;

      if (from != null && !from.isValid()) {
        from = moment();
      }

      if (to != null && !to.isValid()) {
        to = moment();
      } else if (from != null && to != null) {
        if (to.isBefore(from)) {
          to = from;
        }
      }

      let parsedFilter = { ...filter } as any;
      parsedFilter.from = from ? from.endOf('day').format(API_DATE_FORMAT) : parsedFilter.from;
      parsedFilter.to = to ? to.endOf('day').format(API_DATE_FORMAT) : parsedFilter.to;
      parsedFilter.accounts = routeParams.accounts == 'current' ? customerId : routeParams.accounts ? routeParams.accounts.split('&').map((id) => {
        return typeof id == 'number' ? id.toString() : id;
      }) : [customerId];
      parsedFilter.account = parsedFilter.accounts.length > 0 ? parsedFilter.accounts[0] : customerId;
      parsedFilter.interval = routeParams.interval ? routeParams.interval == 'custom' ? null : routeParams.interval : 'week';

      this.setState({
        initialized: true,
        initializedWithData: (parsedFilter.from != null && parsedFilter.to != null) || (routeParams.id && routeParams.id == 'projects')
      });

      if (router.location.query.projectId) {
        parsedFilter.id = router.location.query.projectId;
      }

      if (router.location.query.categories && router.location.query.categories.length > 0) {
        parsedFilter.category = router.location.query.categories.split('|').map((name) => {
          return name.trim();
        });
      }

      if (router.location.query.products && router.location.query.products.length > 0) {
        parsedFilter.product = router.location.query.products.split('|').map((name) => {
          return name.trim();
        });
      }

      if (router.location.query.areas && router.location.query.areas.length > 0) {
        parsedFilter.area = router.location.query.areas.split('|').map((name) => {
          return name.trim();
        });
      }

      if (routeParams.id) {
        for (let i in tabMap) {
          if (tabMap[i] == routeParams.id) {
            parsedFilter.dashboard = parseInt(i);
            break;
          }
        }
      }

      setFilterAndInitReports(parsedFilter);
    }
  }

  handleDateChange = (date) => {
    this.props.setPeriodAndSearch(date);
  }

  /**
   * Render the dashboard
   * @returns {any}
   */
  renderDashboard() {

    const { intl, dashboards, selectedDashboard } = this.props;

    switch (selectedDashboard) {
      case 'foodwaste':
        return (
          <Dashboard loadingTitle={intl.messages['base.loading'] + ' ' + intl.messages['food_waste'].toLowerCase()}
                     data={dashboards['registrations']} dashboardId={'registrations'}/>
        );
      case 'projects':
        return (
          <Dashboard data={dashboards['projects']} dashboardId={'projects'}/>
        );
      case 'sales':
        return (
          <Dashboard noDataString='report.sales.no_data.description'
                     loadingTitle={intl.messages['base.loading'] + ' ' + intl.messages['report.sales_tab'].toLowerCase()}
                     data={dashboards['sales']} dashboardId={'sales'}/>
        );
    }
  }

  /**
   * Render content
   * @returns {any}
   */
  renderContent() {

    const { intl, loaded } = this.props;

    if (!loaded) {
      return (
        <div className='empty-data placeholder gettingStartedContainer'>
          <div>
            <h1>{intl.messages['reports.dashboard.instructions.headline']}</h1>
            <p>
              {intl.messages['reports.dashboard.instructions']}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className='reportsDashboardsContainer'>
        {this.renderDashboard()}
      </div>
    );
  }

  /**
   * Render the component
   * @returns {any}
   */
  render() {

    const { loaded, intl, searchCriteria: { from, to, interval } } = this.props;
    let { filterShouldFloat, initialized, initializedWithData } = this.state;

    if (!initialized || !loaded) {
      return (
        <div className='reportsPageContainer' id='reportsPageContainer'>
          <Helmet title={intl.messages['reports']}/>
        </div>
      );
    }

    return (
      <MuiThemeProviderV0 muiTheme={customThemeV0}>
        <div className={classnames('reportsPageContainer', { ['floating']: filterShouldFloat })}
             id='reportsPageContainer'>
          <Helmet title={intl.messages['reports']}/>
          <div id='reportsTimeFilter'
               className={classnames('timeFilterContainer', { ['floating']: filterShouldFloat })}>
            <TimeFilter
              from={from}
              to={to}
              interval={interval}
              withIntervalSelector={true}
              onDateChange={this.handleDateChange}
            />
          </div>
          <FilterDialog initial={initializedWithData}/>
          {
            this.renderContent()
          }
          <div style={{ position: 'fixed', bottom: '24px' }} data-iframe-height/>
        </div>
      </MuiThemeProviderV0>
    );
  }
}

const mapDispatchToProps = ({
  setPeriodAndSearch,
  setFilterAndInitReports,
  getReportsPath
});

const mapStateToProps = state => ({
  customerId: state.user.customerId != undefined ? state.user.customerId + '' : undefined,
  filter: state.reports.filter,
  searchCriteria: state.reports.searchCriteria,
  dashboards: state.reports.dashboards,
  selectedDashboard: tabMap[state.reports.searchCriteria.dashboard] || 'foodwaste',
  loading: state.reports.loading,
  loaded: state.reports.loaded,
  initializedSettings: !state.settings.isInitial
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ReportsPage));
