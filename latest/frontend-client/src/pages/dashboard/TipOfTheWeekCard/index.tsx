import * as React from 'react';
import { RootState } from 'redux/rootReducer';
import { fetchTips } from 'redux/ducks/tips';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import TipCard from 'dashboard/TipOfTheWeekCard/TipCard';
import LoadingPlaceHolder from 'LoadingPlaceholder';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type TipOfTheWeekCardProps = StateProps & DispatchProps & InjectedIntlProps;

const TipOfTheWeekCard: React.FunctionComponent<TipOfTheWeekCardProps> = (props) => {
  const { tips, hasTipsLoaded, isLoading, fetchTips } = props;

  React.useEffect(() => {
    if (!hasTipsLoaded && !isLoading) {
      void fetchTips();
    }
  }, []);

  return hasTipsLoaded ? <TipCard tips={tips} /> : <LoadingPlaceHolder />;
};

const mapStateToProps = (state: RootState) => ({
  tips: state.tips.tips,
  hasTipsLoaded: state.tips.loaded,
  isLoading: state.tips.initializing
});

const mapDispatchToProps = {
  fetchTips
};
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(TipOfTheWeekCard));
