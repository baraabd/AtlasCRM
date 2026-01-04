import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { LeadsProvider } from './src/state/LeadsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LeadsProvider>
        <RootNavigator />
      </LeadsProvider>
    </SafeAreaProvider>
  );
}
