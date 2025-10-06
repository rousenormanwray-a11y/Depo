import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, StatusBar } from 'react-native';

import { store, persistor } from './store/store';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { colors } from './theme/colors';
import GlobalToastHost from './components/common/GlobalToastHost';

const App: React.FC = () => {
  const linking: LinkingOptions<any> = {
    prefixes: ['chaingive://', 'https://chaingive.ng/app'],
    config: {
      screens: {
        Auth: {
          screens: {
            Login: 'login',
            Register: 'register',
            OTP: 'otp',
          },
        },
        Main: {
          screens: {
            Home: {
              screens: {
                HomeScreen: 'home',
                TransactionHistory: 'transactions',
              },
            },
            Marketplace: 'marketplace',
            Profile: 'profile',
          },
        },
      },
    },
  };
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <Provider store={store}>
          <PersistGate 
            loading={<LoadingSpinner visible={true} message="Initializing app..." />} 
            persistor={persistor}
          >
            <SafeAreaProvider>
              <NavigationContainer linking={linking}>
                <StatusBar
                  barStyle="light-content"
                  backgroundColor={colors.primary}
                />
                <AppNavigator />
                <GlobalToastHost />
              </NavigationContainer>
            </SafeAreaProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;