import * as React from 'react';
import Helmet from 'react-helmet';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import BasicSettings from './components/settings/basic';
import RegistrationSettings from './components/settings/registrations';
import AccountSettings from './components/settings/accounts';
import AlarmsPanel from './components/settings/alarms';
import GuestTypes from './components/settings/guestTypes';
import Filters, { SettingsFilter } from './components/filters';
import * as settingsDispatch from 'redux/ducks/settings';
import * as uiDispatch from 'redux/ducks/ui';
import * as registrationPointsDispatch from 'redux/ducks/data/registrationPoints';
import { RootState } from 'redux/rootReducer';
import { getSettings, SavedSettings, SettingsActions } from 'redux/ducks/settings';
import { ThunkDispatch } from 'redux-thunk';
import { UiActions } from 'redux/ducks/ui';
import { DataRegistrationPointsActions } from 'redux/ducks/data/registrationPoints';
import './index.scss';
import Goals from 'settings/components/settings/goals';
import ScaleOptions from 'settings/components/settings/scaleOptions';

export interface ComponentState {
  filters: SettingsFilter[];
}

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface ComponentProps extends StoreProps, DispatchProps, InjectedIntlProps {}

export class SettingsPage extends React.Component<ComponentProps, ComponentState> {
  constructor(props: ComponentProps) {
    super(props);
    const { intl } = this.props;
    this.state = {
      filters: [
        {
          label: intl.messages['settings.basic'],
          id: 'basic',
          active: this.props.currentFilter === 'basic',
          component: <BasicSettings key='basic' onSubmit={this.basicSettingsHandler} />
        },
        {
          label: intl.messages['registrationPoints'],
          id: 'registrationPoints',
          active: this.props.currentFilter === 'registrationPoints',
          component: <RegistrationSettings key='product' contentType={'registrationPoint'} />
        },
        {
          label: intl.messages['registrationGoals'],
          id: 'targets',
          active: this.props.currentFilter === 'targets',
          component: <Goals key='goals' />
        },
        {
          label: intl.messages['scaleOptions'],
          id: 'scaleOptions',
          active: this.props.currentFilter === 'scaleOptions',
          component: <ScaleOptions key='scaleOptions' />
        },
        {
          label: intl.messages['accounts'],
          id: 'accounts',
          active: this.props.currentFilter === 'accounts',
          component: <AccountSettings key='accounts' />
        },
        {
          label: intl.messages['alarms'],
          id: 'alarms',
          active: this.props.currentFilter === 'alarms',
          component: <AlarmsPanel key='alarms' />
        },
        {
          // eslint-disable-next-line
          label: (intl.messages['settings.guestType'] as any).other,
          id: 'guestTypes',
          active: this.props.currentFilter === 'guestTypes',
          component: <GuestTypes key='guestTypes' />
        }
      ]
    };
  }

  async componentDidMount() {
    await this.props.getSettings();
    await this.props.getRegistrationPointData();
  }

  basicSettingsHandler = (data: Partial<SavedSettings>) => {
    const { updateSettings } = this.props;
    void updateSettings(data);
  };

  filterChangeHandler = (filter: SettingsFilter) => {
    const { filters: stateFilters } = this.state;
    const nextFilters = stateFilters.map((f) => ({ ...f, active: f.id === filter.id }));

    this.setState({ filters: nextFilters });
    this.props.updateFilter(filter.id);
    this.forceUpdate();
  };

  render() {
    const { intl } = this.props;

    const { filters } = this.state;
    return (
      <div className='settingsPageContainer'>
        <Helmet title={intl.messages['settings.headline']} />
        <Filters filters={filters} changeFilter={this.filterChangeHandler} />
        <div className='settingsContent'>
          {filters.map((filter) => {
            if (filter.active && filter.component) {
              const { component } = filter;
              return component;
            }
            return null;
          })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  settingsData: getSettings(state),
  currentFilter: getSettings(state).currentFilter
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<
    unknown,
    unknown,
    SettingsActions | UiActions | DataRegistrationPointsActions
  >
) => ({
  getSettings: () => dispatch(settingsDispatch.fetch()),
  updateFilter: (id: string) => dispatch(settingsDispatch.updateFilter(id)),
  updateSettings: (data) => dispatch(settingsDispatch.update(data)),
  getRegistrationPointData: () => dispatch(registrationPointsDispatch.findTree()),
  showModal: (modal) => dispatch(uiDispatch.showModal(modal))
});

const SettingsPageConnect = connect<StoreProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SettingsPage));

export default SettingsPageConnect;
