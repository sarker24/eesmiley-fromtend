import * as React from 'react';
import Helmet from 'react-helmet';
import ProjectStatus from './components/project-status';
import AfterSignUpPopUpWrapper from './components/after-sign-up-pop-up-wrapper';
import TipDialog from 'components/modalContent/tipOfTheWeekDialog';
import SalesDialog from 'components/modalContent/salesDialog';
import * as uiDispatch from 'redux/ducks/ui';
import * as projectsDispatch from 'redux/ducks/projects';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Container from 'components/container';
import SalesIcon from '@material-ui/icons/AttachMoney';
import TipIcon from '@material-ui/icons/ThumbsUpDown';
import ScaleIcon from 'components/icons/scale';
import FrequencyGauge from './components/widgets/frequencyGauge';
import ImprovementsGauge from './components/widgets/improvementsGauge';
import ExpectedFoodWasteGauge from './components/widgets/expectedFoodWasteGauge';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as dashboardDispatch from 'redux/ducks/dashboard';
import IntroWizard from 'components/intro-wizard';
import FilterController from '../../components/filterController';
import { fetchTips, TipActions } from 'redux/ducks/tips';
import { Button } from '@material-ui/core';
import { RootState } from 'redux/rootReducer';
import { getSettings } from 'redux/ducks/settings';
import { DashboardActions, DashboardChangeFilter } from 'redux/ducks/dashboard';
import { Project, ProjectsActions } from 'redux/ducks/projects';
import { Modal, UiActions } from 'redux/ducks/ui';
import { ThunkDispatch } from 'redux-thunk';
import './index.scss';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type ReportingDashProps = StateProps & DispatchProps & InjectedIntlProps;

export class ReportingDash extends React.Component<ReportingDashProps> {
  static defaultProps = {
    tipsLoaded: false
  };

  componentDidMount() {
    const { refresh, settings, getProjects, tipsLoaded, fetchTips } = this.props;

    if (!settings.isInitial) {
      void refresh();
      void getProjects();

      if (!tipsLoaded) {
        void fetchTips();
      }
    }
  }

  componentDidUpdate(prevProps: Readonly<ReportingDashProps>) {
    const { refresh, getProjects, tipsLoaded, fetchTips, settings } = this.props;
    if (prevProps.settings.isInitial !== settings.isInitial) {
      void refresh();
      void getProjects();
      if (!tipsLoaded) {
        void fetchTips();
      }
    }
  }

  render() {
    const {
      intl,
      client,
      openModal,
      projects,
      setProject,
      settings,
      currency,
      massUnit,
      clearProject,
      tipsLoaded,
      changeFilter,
      filter
    } = this.props;

    if (client === 'scale') {
      browserHistory.push('/registration');
    }

    return (
      <div className='dashboard'>
        <IntroWizard />

        <Helmet title={intl.messages['dashboard.headline']} />
        <div className='flex-set'>
          <FilterController value={filter} accountSelectorEnabled={true} onChange={changeFilter} />
        </div>
        <div className='flex-set'>
          <div className='dashGaugeContainer'>
            <Container
              title={intl.messages['dashboard.quick_actions']}
              className='quickActionsContainer'
            >
              <Button
                className='tipQuickActionButton quickActionButton'
                startIcon={<TipIcon />}
                disabled={!tipsLoaded}
                onClick={() =>
                  openModal({
                    content: <TipDialog />,
                    className: 'tipModal',
                    title: intl.messages['dashboard.tip']
                  })
                }
              >
                <span className='quickActionButton__text'>
                  {intl.messages['dashboard.see_tip']}
                </span>
              </Button>
              <Button
                className='salesQuickActionButton quickActionButton '
                startIcon={<SalesIcon />}
                onClick={() =>
                  openModal({
                    content: <SalesDialog currency={currency} massUnit={massUnit} />,
                    className: 'salesModal',
                    title: intl.messages['sales.dialog.headline']
                  })
                }
              >
                <span className='quickActionButton__text'>
                  {intl.messages['dashboard.salesBtn']}
                </span>
              </Button>
              <Button
                className='registrationQuickActionButton quickActionButton'
                startIcon={<ScaleIcon />}
                onClick={() => {
                  browserHistory.push('/registration');
                }}
              >
                <span className='quickActionButton__text'>
                  {intl.messages['dashboard.register_foodwaste']}
                </span>
              </Button>
            </Container>
            <FrequencyGauge />
            <ImprovementsGauge />
          </div>
        </div>
        <div className='flex-set'>
          <ProjectStatus
            openModal={openModal}
            projectsFiltered={projects}
            clearProject={clearProject}
            setProject={setProject}
          />
          <ExpectedFoodWasteGauge />
        </div>
        <AfterSignUpPopUpWrapper settings={settings} />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  projects: state.projects.projects,
  isLoggedIn: state.auth.isLoggedIn,
  client: state.user.client,
  isMenuOpen: state.ui.isMenuOpen,
  settings: getSettings(state),
  currency: getSettings(state).currency,
  massUnit: getSettings(state).unit,
  tipsLoaded: state.tips.loaded,
  user: state.user,
  filter: { dateFilter: state.dashboard.filter, accountIds: state.dashboard.accounts }
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<
    RootState,
    void,
    ProjectsActions | DashboardActions | UiActions | TipActions
  >
) => ({
  getProjects: () => dispatch(projectsDispatch.getProjects()),
  setProject: (projectData: Project) => dispatch(projectsDispatch.setProject(projectData)),
  clearProject: () => dispatch(projectsDispatch.clearProject()),
  fetchTips: () => dispatch(fetchTips()),
  refresh: () => dispatch(dashboardDispatch.refresh()),
  changeFilter: (filter: DashboardChangeFilter) => dispatch(dashboardDispatch.changeFilter(filter)),
  openModal: (modal: Modal) => {
    dispatch(uiDispatch.showModal(modal));
  }
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ReportingDash));
