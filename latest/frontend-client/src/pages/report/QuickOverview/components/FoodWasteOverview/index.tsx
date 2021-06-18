import * as React from 'react';
import { ReportActions } from 'redux/ducks/reports-new';
import FoodWasteOverview from './FoodWasteOverview';
import { connect } from 'react-redux';
import * as reportsDispatch from 'redux/ducks/reports-new';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type FoodWasteOverviewContainerProps = DispatchProps & StateProps;

const FoodWasteOverviewContainer: React.FunctionComponent<FoodWasteOverviewContainerProps> = (
  props
) => {
  const { setBasis, basis } = props;

  const handleTabChange = (basis) => {
    setBasis(basis);
  };

  return <FoodWasteOverview basis={basis} onTabChange={handleTabChange} />;
};

const mapStateToProps = (state: RootState) => ({
  basis: state.newReports.basis
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, ReportActions>) => ({
  setBasis: (basis) => dispatch(reportsDispatch.changeBasis(basis))
});

export default connect<StateProps, unknown, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(FoodWasteOverviewContainer);
