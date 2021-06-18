import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { getMessagesState } from './selectors';
import { RootState } from 'redux/rootReducer';

// This function will map the current redux state to the props for the component that it is "connected" to.
// When the state of the redux store changes, this function will be called, if the props that come out of
// this function are different, then the component that is wrapped is re-rendered.
function mapStateToProps(state: RootState) {
  const { locale } = state.ui;

  return {
    locale: locale === 'phraseapp' ? 'en' : locale,
    key: locale,
    // eslint-disable-next-line
    messages: getMessagesState(state)
  };
}

type StateProps = ReturnType<typeof mapStateToProps>;
export default connect<StateProps, any, any>(mapStateToProps)(IntlProvider);
