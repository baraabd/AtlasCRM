import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/state/AuthContext';
// ✅ استيراد MetadataProvider الجديد
import { MetadataProvider } from './src/state/MetadataContext';
import { LeadsProvider } from './src/state/LeadsContext';

// Mock Sync Runner (Placeholder)
function SyncRunner() {
  return null; // سيتم تطويره لاحقاً في Sprint 5 (Offline Sync)
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      
      {/* 1. نظام المصادقة أولاً */}
      <AuthProvider>
        
        {/* 2. نظام البيانات الوصفية (القوائم والخدمات) */}
        {/* نضعه هنا ليتمكن من استخدام التوكن من AuthProvider */}
        <MetadataProvider>

          {/* 3. بيانات العملاء والعمليات */}
          <LeadsProvider>
            
            {/* الخدمات الخلفية */}
            <SyncRunner />
            
            {/* التنقل والشاشات */}
            <RootNavigator />
            
          </LeadsProvider>
          
        </MetadataProvider>

      </AuthProvider>
      
    </SafeAreaProvider>
  );
}