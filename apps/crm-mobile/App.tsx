import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/state/AuthContext';
import { LeadsProvider } from './src/state/LeadsContext';
import { MetadataProvider } from './src/state/MetadataContext';

function SyncRunner() {
  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <AuthProvider>
          <MetadataProvider>
            <LeadsProvider>
              <SyncRunner />
              <RootNavigator />
              <StatusBar style="auto" />
            </LeadsProvider>
          </MetadataProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});