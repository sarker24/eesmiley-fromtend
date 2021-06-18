/*
 * Iframe container for Reports module v2
 */
import * as React from 'react';
import { iframeResizer } from 'iframe-resizer';
import LoadingPlaceholder from 'components/LoadingPlaceholder';

export interface IComponentProps {
  src: string;
  loadingTitle?: string;
  id: string;
}

export interface IComponentState {
  loaded: boolean;
}

class IFrameContainer extends React.Component<IComponentProps, IComponentState> {

  iframes: any[];

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      loaded: false
    };

    this.iframes = [];
  }

  componentWillUnmount(): void {
    const { id } = this.props;
    const thisFrame = this.iframes.find(iframe => iframe.id === id && iframe.iFrameResizer);

    if(!thisFrame) {
      return;
    }

    thisFrame.iFrameResizer.close();
  }

  handleOnLoad = event => {
    const id = `#${event.target.id}`;
    const { loaded } = this.state;

    if(loaded) {
      return;
    }

    this.iframes = iframeResizer({
      heightCalculationMethod: 'taggedElement',
      scrolling: true,
      checkOrigin: [window['sysvars'].STATS_URL] }, id);

    this.setState({ loaded: true });
  }

  render() {

    const { src, id, loadingTitle, ...rest } = this.props;
    return (
      <div className='iframeContainer' {...rest}>
        {
          !this.state.loaded && src &&
            <LoadingPlaceholder title={loadingTitle} />
        }
        { src != '' &&
          <iframe
            style={{ display: this.state.loaded ? 'block' : 'none' }}
            id={id}
            scrolling={'yes'}
            src={src}
            seamless={true}
            onLoad={this.handleOnLoad}
          >
          </iframe>
        }
      </div>
    );
  }
}

export default IFrameContainer;
