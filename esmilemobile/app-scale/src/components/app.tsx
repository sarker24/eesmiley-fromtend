import * as React from 'react';
import { version } from '../../package.json';

import { StatusBar, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import DataTransfer from '../core/data-transfer';
import EsmileyOverlay, { Behavior } from '../components/esmiley-overlay';

import Config from '../config';

export interface IComponentProps {}

export interface IComponentState {
  loading: boolean;
  hasError: boolean;
}

export default class AppScale extends React.Component<IComponentProps, IComponentState> {
  webView: WebView;
  dataTransfer: DataTransfer;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      hasError: false
    };
  }

  componentDidMount() {
    this.dataTransfer = new DataTransfer(this.webView);
    this.dataTransfer.open();
  }

  componentWillUnmount() {
    this.dataTransfer.close();
    delete this.dataTransfer;
  }

  render() {
    const { loading, hasError } = this.state;
    const uri = `${Config.appUri}?client=${Config.clientParameter}`;
    const showOverlay = loading || hasError;

    /*
    This script is run immediately after the web page loads for the first time.
    It only runs once, even if the page is reloaded or navigated away.
    note: Should return true or you'll sometimes get silent failures
    * */
    const injectVersion = `
      const textContainer = document.createElement('div');
      const versionTextNode = document.createTextNode('version ${version}');
      textContainer.style.marginTop = '16px';
      textContainer.style.paddingLeft = '24px';
      textContainer.appendChild(versionTextNode);
      document.body.appendChild(textContainer);
      true;
    `;

    // instead of relying on url query param scale,
    // injects global variable before any content is rendered, so that we can use that
    // later on in the web app to check if we are using scale app.
    // note: Should return true or you'll sometimes get silent failures
    const injectGlobalScaleEnv = `
     window.isScaleApp = true
     true;
    `;

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor='rgb(12, 105, 192)' barStyle='light-content' />
        <WebView
          style={styles.webView}
          ref={(webView) => (this.webView = webView)}
          source={{ uri }}
          onLoadEnd={() =>
            // Don't hide loading screen to soon
            // onLoadEnd is called before onError, we don't want the loading to stop before we handle the error
            setTimeout(() => this.setState({ loading: false }), 300)
          }
          onError={() => this.setState({ hasError: true })}
          onMessage={(event) => {
            // DO NOT CONSOLE LOG the "event" param! (console.log(event))
            // That will cause this callback to crash without an error or warning, and you're left wondering why the code isn't running :-)
            const { data } = event.nativeEvent;
            const parsedData = JSON.parse(data);

            if (parsedData.startScan) {
              this.dataTransfer.enableBluetoothAndScan();
            } else if (
              parsedData.hasOwnProperty('canUseBluetooth') &&
              !parsedData.canUseBluetooth
            ) {
              this.dataTransfer.closeTheBleConnection();
            }
          }}
          injectedJavaScript={injectVersion}
          injectedJavaScriptBeforeContentLoaded={injectGlobalScaleEnv}
        />
        <EsmileyOverlay
          visible={showOverlay}
          behavior={loading ? Behavior.SPIN : Behavior.SHOW_ERROR}
          reloadHandler={() => {
            this.setState({ loading: true, hasError: false });
            this.webView.reload();
          }}
        />
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  webView: {
    flex: 1
  }
});
