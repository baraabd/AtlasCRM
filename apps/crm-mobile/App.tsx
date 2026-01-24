// apps/crm-mobile/App.tsx

import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/state/AuthContext';
import { LeadsProvider } from './src/state/LeadsContext';

// Mock Sync Runner (Placeholder)
function SyncRunner() {
  return null; // This would be your background sync logic
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      
      <AuthProvider>
        <LeadsProvider>
          {/* Background Services */}
          <SyncRunner />
          
          {/* Navigation */}
          <RootNavigator />
        </LeadsProvider>
      </AuthProvider>
      
    </SafeAreaProvider>
  );
}