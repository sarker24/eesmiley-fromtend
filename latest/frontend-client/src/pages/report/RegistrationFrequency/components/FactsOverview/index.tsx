import * as React from 'react';
import FactsOverview from './FactsOverview';
import * as reportDispatch from 'redux/ducks/reportData';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { ReportActions } from 'redux/ducks/reports-new';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type FactsOverviewContainerProps = DispatchProps & StateProps;

const identifier = 'regFrequencyMetrics';

const FactsOverviewContainer: React.FunctionComponent<FactsOverviewContainerProps> = ({
  fetchData,
  regFrequencyMetrics,
  filter
}) => {
  useEffect(() => {
    void fetchData(identifier);
  }, [
    filter.basis,
    filter.dimension,
    filter.timeRange,
    filter.period,
    filter.filter,
    filter.selectedGuestTypeNames
  ]);

  return <FactsOverview regFrequencyMetrics={regFrequencyMetrics} />;
};

const mapStateToProps = (state: RootState) => ({
  regFrequencyMetrics: state.reportData[identifier],
  filter: state.newReports
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  fetchData: (identifier) => dispatch(reportDispatch.fetchData(identifier))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(FactsOverviewContainer);
