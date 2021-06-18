import * as React from 'react';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import FilterHeader from './FilterHeader';
import * as reportDispatch from 'redux/ducks/reports-new';

import { withRouter, WithRouterProps } from 'react-router';
import parseFilterQueryParams from './utils/parseFilterQueryParams';
import {
  Dimension,
  ReportFilterState,
  getCachedState,
  ReportActions,
  RegistrationPointIds,
  Order
} from 'redux/ducks/reports-new';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import { getCompareToFilters, getFilter, getGuestTypes } from 'redux/ducks/reports-new/selectors';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { makeStyles } from '@material-ui/styles';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface ComponentProps extends StateProps, DispatchProps, WithRouterProps {}

const useStyles = makeStyles({
  spinner: { margin: '0 -12px' }
});

const FilterHeaderContainer: React.FunctionComponent<ComponentProps> = (props) => {
  const classes = useStyles(props);
  const {
    customerId,
    filter,
    registrationPointFilters,
    initFilter,
    changeDimension,
    location,
    updateURL,
    onAccountChange,
    onRegistrationPointChange,
    onAddRegistrationPointFilter,
    onRemoveRegistrationPointFilter,
    onOrderChange,
    guestTypeNames,
    onGuestTypeChange
  } = props;

  useEffect(() => {
    updateLocation();
  }, [filter]);

  const updateLocation = () => {
    if (!filter.loading) {
      updateURL();
    }
  };

  useEffect(() => {
    // since this comp is mounted on each report page change
    if (!filter.isInitialized && !filter.isInitializing) {
      initFilters();
    }
  }, []);

  const initFilters = () => {
    const parsedFilter = parseFilterQueryParams(location);
    const cachedState = getCachedState(customerId);
    // if user has not provided any query params, read them from cache
    if (cachedState && location.search.length === 0) {
      const nextFilterState = parsedFilter.basis
        ? { ...cachedState.state, basis: parsedFilter.basis }
        : cachedState.state;
      void initFilter(nextFilterState);
    } else {
      void initFilter(parsedFilter);
    }
  };

  const handleDimension = (event: React.MouseEvent<HTMLElement>, newDimension: Dimension) => {
    if (!newDimension) {
      return;
    }

    void changeDimension(newDimension);
  };

  const handleGuestTypeChange = (names: string[]) => {
    void onGuestTypeChange(names);
  };

  const filterConfig = {
    enableDimension: location.pathname !== '/report/frequency',
    enableRegistrationPoints: location.pathname !== '/report/frequency',
    enableComparison: location.pathname === '/report/accounts',
    enableSort: ['/report/accounts', '/report/frequency'].includes(location.pathname)
  };

  return filter.isInitialized ? (
    <FilterHeader
      filter={filter}
      onDimensionChange={handleDimension}
      config={filterConfig}
      registrationPointFilters={registrationPointFilters}
      onAccountChange={onAccountChange}
      onRegistrationPointChange={onRegistrationPointChange}
      onAddRegistrationPointFilter={onAddRegistrationPointFilter}
      onRemoveRegistrationPointFilter={onRemoveRegistrationPointFilter}
      onOrderChange={onOrderChange}
      guestTypeNames={guestTypeNames}
      onGuestTypeChange={handleGuestTypeChange}
    />
  ) : (
    <LoadingPlaceholder className={classes.spinner} />
  );
};

const mapStateToProps = (state: RootState) => ({
  customerId: state.user.customerId,
  filter: state.newReports,
  // temp fix; need to refactor report filter store, but cant efficiently until
  // the whole report page layout is refactored so that filter is initialised first
  // before rendering report sub page (since they use filters)
  registrationPointFilters: [getFilter(state), ...getCompareToFilters(state)],
  guestTypeNames: getGuestTypes(state).map((guest) => guest.name)
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  initFilter: (filter: NestedPartial<ReportFilterState>) => dispatch(reportDispatch.init(filter)),
  changeDimension: (dimension: Dimension) => dispatch(reportDispatch.changeDimension(dimension)),
  updateURL: () => dispatch(reportDispatch.updateURL()),
  onAccountChange: (id: number, accounts: string[]) =>
    dispatch(reportDispatch.changeCompareToFilter(id, { accounts })),
  onRegistrationPointChange: (id: number, points: RegistrationPointIds) =>
    dispatch(reportDispatch.changeCompareToFilter(id, { selectedRegistrationPoints: points })),
  onAddRegistrationPointFilter: () => dispatch(reportDispatch.addCompareToFilter({})),
  onRemoveRegistrationPointFilter: (id: number) =>
    dispatch(reportDispatch.removeCompareToFilter(id)),
  onOrderChange: (id: number, order: Order) =>
    dispatch(reportDispatch.changeCompareToFilter(id, { order })),
  onGuestTypeChange: (names: string[]) => dispatch(reportDispatch.changeGuestTypes(names))
});

export default withRouter<WithRouterProps>(
  connect<StateProps, DispatchProps, WithRouterProps>(
    mapStateToProps,
    mapDispatchToProps
  )(FilterHeaderContainer)
);
