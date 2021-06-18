import * as React from 'react';

import EsmileyOverlay, { Behavior } from './components/esmiley-overlay';
import { StyleSheet, View } from 'react-native';
import AppScale from './components/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DisclaimerKey = 'esmiley/has-seen-disclaimer';

const App: React.FunctionComponent = () => {
  const [showDisclaimer, setShowDisclaimer] = React.useState<null | boolean>(null);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const behaviour = hasError
    ? Behavior.SHOW_ERROR
    : showDisclaimer === true
    ? Behavior.SHOW_FIRST_TIME_DISCLAIMER
    : Behavior.SPIN;

  // we only want to show the background permission disclaimer once.
  // after that we store a flag to local db and not show the disclaimer again.

  React.useEffect(() => {
    const fetchDisclaimerSeenFlag = async (): Promise<boolean> => {
      try {
        const hasSeenDisclaimerFlag = await AsyncStorage.getItem(DisclaimerKey);
        if (hasSeenDisclaimerFlag === null) {
          return false;
        }
        return JSON.parse(hasSeenDisclaimerFlag);
      } catch (error: unknown) {
        setHasError(true);
      }
    };

    (async () => {
      const flag = await fetchDisclaimerSeenFlag();
      setShowDisclaimer(!flag);
    })();
  }, []);

  const setDisclaimerSeenFlag = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(DisclaimerKey, JSON.stringify(true));
    } catch (error: unknown) {
      setHasError(true);
    }
  };

  const handleDisclaimerClick = () => {
    setShowDisclaimer(false);
    setDisclaimerSeenFlag();
  };

  return !hasError && showDisclaimer === false ? (
    <AppScale />
  ) : (
    <View style={styles.container}>
      <EsmileyOverlay visible={true} behavior={behaviour} reloadHandler={handleDisclaimerClick} />
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default App;
