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
const identifier = 'foodWasteMetrics';

const FactsOverviewContainer: React.FunctionComponent<FactsOverviewContainerProps> = (props) => {
  const { fetchData, foodWasteMetrics, error, filter } = props;

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

  return <FactsOverview foodWasteMetrics={foodWasteMetrics} error={error} />;
};

const mapStateToProps = (state: RootState) => ({
  foodWasteMetrics: state.reportData[identifier],
  error: state.reportData[identifier].error,
  filter: state.newReports
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  fetchData: (identifier) => dispatch(reportDispatch.fetchData(identifier))
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(FactsOverviewContainer);
