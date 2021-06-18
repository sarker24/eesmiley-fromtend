import History from './History';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import * as React from 'react';
import { connect } from 'react-redux';
import * as registrationsDispatch from 'redux/ducks/data/registrations';
import { DataRegistrationActions, find as getRegistrations } from 'redux/ducks/data/registrations';
import moment from 'moment';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type HistoryContainerProps = StateProps & DispatchProps;

class HistoryContainer extends React.Component<HistoryContainerProps> {
  private blockLoadingMessage: boolean;

  componentDidMount() {
    void this.props.getRegistrations();
  }

  deleteHandler = async (id: string) => {
    this.blockLoadingMessage = true;
    (await this.props.deleteRegistration(id)) && (await this.props.getRegistrations());
  };

  render() {
    let { loading } = this.props;
    const { registrations, registrationPointsMap } = this.props;

    loading = this.blockLoadingMessage ? false : loading;
    this.blockLoadingMessage = false;

    return loading ? (
      <LoadingPlaceholder />
    ) : (
      <History
        registrations={registrations}
        deleteHandler={this.deleteHandler}
        registrationPointsMap={registrationPointsMap}
      />
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { registrations, registrationPoints } = state.data;
  const loading =
    registrations.loading || registrationPoints.initializing || registrationPoints.treeInitializing;
  return {
    loading,
    registrationPoints: state.data.registrationPoints.allNodes,
    registrations: registrations.data,
    registrationPointsMap: state.data.registrationPoints.registrationPointsMap
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, DataRegistrationActions>) => ({
  getRegistrations: () => dispatch(getRegistrations(moment().subtract(1, 'year'))),
  deleteRegistration: (id: string) => dispatch(registrationsDispatch.remove(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(HistoryContainer);
