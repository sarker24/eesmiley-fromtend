import * as React from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Button,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Pressable,
  Modal
} from 'react-native';

const logo = require('../../resources/esmiley_icon_1024x1024.png');

export enum Behavior {
  SPIN,
  SHOW_ERROR,
  SHOW_FIRST_TIME_DISCLAIMER
}

export interface WithPressUp {
  onPress: (event?: NativeSyntheticEvent<NativeTouchEvent>) => void;
}

export interface IComponentProps {
  visible: boolean;
  behavior: Behavior;
  reloadHandler: () => any;
}

export const Spinner: React.FunctionComponent = () => (
  <ActivityIndicator color='#0084c7' size={'large'} />
);

export const Error: React.FunctionComponent<WithPressUp> = ({ onPress }) => (
  <View style={styles.content}>
    <Text>{'Service unreachable.'}</Text>
    <Text style={styles.contentText}>{'Please check your internet connection.'}</Text>
    <Button title='Retry' onPress={onPress} />
  </View>
);

export const Disclaimer: React.FunctionComponent<WithPressUp> = ({ onPress }) => (
  <View style={styles.content}>
    <Text style={styles.title}>Connecting to bluetooth scales</Text>
    <Text style={styles.contentText}>
      This app will ask for a permission to background location in order to connect to a scale that
      supports bluetooth.
    </Text>
    <Text style={styles.contentText}>
      The app remains connected to the bluetooth scale even if the app is not in use.
    </Text>
    <Text style={styles.contentText}>
      If you don't have a bluetooth scale, the permission is not needed.
    </Text>
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>OK</Text>
    </Pressable>
  </View>
);

const ComponentMap = {
  [Behavior.SHOW_ERROR]: Error,
  [Behavior.SPIN]: Spinner,
  [Behavior.SHOW_FIRST_TIME_DISCLAIMER]: Disclaimer
};
export default ({ behavior, reloadHandler, visible }: IComponentProps) => {
  const Component: React.FunctionComponent<Partial<WithPressUp>> = ComponentMap[behavior];
  return (
    <Modal visible={visible}>
      <View style={styles.container}>
        <Image style={styles.image} source={logo} />
        <Component onPress={reloadHandler} />
      </View>
    </Modal>
  );
};

export const styles = StyleSheet.create({
  container: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400
  },
  contentText: {
    marginBottom: 20,
    fontSize: 15,
    textAlign: 'center'
  },
  image: {
    width: 125,
    height: 125,
    marginBottom: 50
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 140,
    alignItems: 'center',
    backgroundColor: '#0084c7'
  },
  buttonText: {
    color: '#ffffff'
  }
});
