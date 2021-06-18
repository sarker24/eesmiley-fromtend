import * as React from 'react';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import SearchIcon from 'material-ui/svg-icons/action/search';
import Card from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import TimeFilter from './../timeFilter';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import { bindActionCreators } from 'redux';
import { search, getDashboardById, resetFilter, setPeriod } from 'redux/ducks/reports';
import FlatButton from 'material-ui/FlatButton';

import DashboardSelector from './../dashboardSelector';
import AccountSelector from './../accountSelector';
import DomainSelector from './../domainSelector';
import { onSubmitForm } from 'utils/helpers';
import ProjectList from '../projectList';
import { IFilterParams } from 'redux/ducks/reports/reducer';
import { RootState } from 'redux/rootReducer';
import { getSettings } from 'redux/ducks/settings';

require('./index.scss');

export interface OwnProps {
  initial?: boolean;
  onResetFilter?: Function;
}

interface StateProps {
  accounts: any[];
  customerId: number;
  filter: IFilterParams;
  selectedDashboardTab: any;
  dashboard: any;
  hasSelectedProject: boolean;
  hasProjects: boolean;
}

export interface IComponentState {
  open: boolean;
}

type FilterDialogProps = StateProps & InjectedIntlProps & OwnProps;

export class FilterDialog extends React.Component<FilterDialogProps, IComponentState> {
  static defaultProps = {
    initial: false,
    selectedDashboardTab: 0
  };

  dialogRef: React.RefObject<any>;
  private actions: {
    resetFilter: Function;
    search: Function;
    setPeriod: Function;
  };

  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    this.actions = bindActionCreators(
      {
        resetFilter,
        search,
        setPeriod
      },
      props.dispatch
    );

    this.resetFilter = this.resetFilter.bind(this);

    this.dialogRef = React.createRef();
  }

  componentDidMount() {
    this.setState({ open: !this.props.initial });
  }

  resetFilter() {
    const { onResetFilter } = this.props;

    this.actions.resetFilter();

    if (this.dialogRef.current) {
      const dialogInner = this.dialogRef.current;
      dialogInner.className = 'filterDialogInner resetted';
      setTimeout(() => {
        dialogInner.className = 'filterDialogInner';
      }, 100);
    }

    if (onResetFilter) {
      onResetFilter();
    }
  }

  handleDateChange = (date) => {
    this.actions.setPeriod(date);
  };

  render() {
    const {
      intl,
      filter: { from, to, interval },
      dashboard,
      hasProjects,
      hasSelectedProject,
      accounts,
      customerId
    } = this.props;
    const hasMultipleAccounts =
      accounts && accounts.length > 0 && (accounts.length > 1 || accounts[0].id != customerId);

    return (
      <form
        onSubmit={onSubmitForm(() => {
          this.setState({ open: false });
          this.actions.search();
        })}
        className='filterDialogWrapper'
      >
        <Card
          className={'filterDialog ' + (this.state.open ? 'active' : 'inactive')}
          expanded={this.state.open}
          ref='popover'
        >
          <div className='filterDialogInner' ref={this.dialogRef}>
            <div className='filterDialogHeader'>
              <h4>{intl.messages['reportSearching']}</h4>
              <IconButton
                style={{
                  width: 36,
                  height: 36,
                  padding: 4,
                  marginTop: -10,
                  marginRight: -10
                }}
                className='closeBtn'
                onClick={() => {
                  this.setState({ open: false });
                }}
                children={<CloseIcon />}
              />
            </div>

            <div className={'filterDialogOption'}>
              <div className='filterDialogOptionInner'>
                <DashboardSelector />
                {hasMultipleAccounts && <AccountSelector />}
              </div>
            </div>

            <div
              className={
                'filterDialogOption ' + (dashboard.projectsFilter ? 'enabled' : 'disabled')
              }
            >
              <Divider />
              <h5>{intl.messages['projects']}</h5>
              {dashboard.projectsFilter && <ProjectList />}
            </div>

            <div
              className={'filterDialogOption ' + (dashboard.timeFilter ? 'enabled' : 'disabled')}
            >
              <Divider />
              <h5>{intl.messages['date']}</h5>
              <TimeFilter
                from={from}
                to={to}
                interval={interval}
                onDateChange={this.handleDateChange}
                required={dashboard.timeFilter}
                dateRangePickerProps={{ openDirection: 'up' }}
              />
            </div>

            <div
              className={'filterDialogOption ' + (dashboard.domainFilter ? 'enabled' : 'disabled')}
            >
              <Divider />
              <h5>{intl.messages['filter']}</h5>
              <DomainSelector required={dashboard.domainFilter} />
            </div>
            <div className='popoverFooter'>
              <FlatButton
                backgroundColor='#f2f2f2'
                labelStyle={{ color: '#757575' }}
                style={{ height: 50 }}
                label={intl.messages['clearSearch']}
                onClick={this.resetFilter}
              />
              <RaisedButton
                primary={true}
                type='submit'
                disabled={dashboard.projectsFilter && (!hasProjects || !hasSelectedProject)}
                style={{ float: 'right', height: 50 }}
                label={intl.messages['search']}
              />
            </div>
          </div>
        </Card>
        <RaisedButton
          overlayStyle={{ borderRadius: '30px' }}
          onClick={() => {
            this.setState({ open: !this.state.open });
          }}
          style={{ width: 166, height: 60 }}
          icon={<SearchIcon />}
          className={'filterBtn pulse ' + (this.state.open ? 'open' : 'closed')}
          primary={true}
          label={intl.messages['search']}
        ></RaisedButton>
      </form>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    accounts: getSettings(state).accounts,
    customerId: state.user.customerId,
    filter: state.reports.filter,
    selectedDashboardTab: state.reports.filter.dashboard,
    dashboard: getDashboardById(state.reports.filter.dashboard),
    hasSelectedProject: state.reports.filter.id != null,
    hasProjects: state.reports.projects.data && state.reports.projects.data.length > 0
  };
};

export default connect<StateProps, {}, OwnProps>(mapStateToProps)(injectIntl(FilterDialog));
