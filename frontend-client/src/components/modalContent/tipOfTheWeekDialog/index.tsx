import { injectIntl, InjectedIntlProps } from 'react-intl';
import './index.scss';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import FailedPlaceholder from 'components/FailedPlaceholder';
import { fetchTips, TipActions } from 'redux/ducks/tips';
import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export interface IComponentState {
  tip: {
    title: string;
    content: string;
    image: string;
  };
}

type TipOfTheWeekDialogProps = StateProps & DispatchProps & InjectedIntlProps;

class TipOfTheWeekDialog extends React.Component<
  TipOfTheWeekDialogProps & InjectedIntlProps,
  IComponentState
> {
  constructor(props: TipOfTheWeekDialogProps) {
    super(props);

    this.state = {
      tip: null
    };
  }

  selectRandomTip = (): void => {
    const { tips, intl } = this.props;

    if (tips.length == 0) {
      return;
    }

    const tipIdx = Math.floor(Math.random() * (tips.length - 1));
    let locale = intl.locale == 'da' ? 'DK' : intl.locale.toUpperCase();
    locale = tips[tipIdx].title.hasOwnProperty(locale) ? locale : 'EN';

    this.setState({
      tip: {
        title: tips[tipIdx].title[locale],
        content: tips[tipIdx].content[locale],
        image: tips[tipIdx].imageUrl
      }
    });
  };

  UNSAFE_componentWillMount() {
    this.selectRandomTip();
  }

  render() {
    const { initializing, failed, fetchTips } = this.props;

    const { tip } = this.state;

    if (initializing) {
      return <LoadingPlaceholder className='tip-placeholder' />;
    } else if (failed) {
      return (
        <FailedPlaceholder
          className='tip-placeholder'
          retryHandler={async () => {
            await fetchTips();
            this.selectRandomTip();
          }}
        />
      );
    }

    if (!tip) {
      return null;
    }

    return (
      <div className='tip'>
        <div
          className='tipImageContainer'
          style={{
            backgroundImage: `url("${tip.image}")`
          }}
        />
        <div className='tipInnerContainer'>
          <h4 className='tipTitle'>{tip.title}</h4>
          <div className='tipContent'>{tip.content}</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  tips: state.tips.tips,
  initial: state.tips.initial,
  initializing: state.tips.initializing,
  failed: state.tips.failed
});

const mapDispatchToProps = (dispatch: ThunkDispatch<unknown, unknown, TipActions>) => ({
  fetchTips: () => dispatch(fetchTips())
});

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TipOfTheWeekDialog));
