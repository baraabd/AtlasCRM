// apps/crm-mobile/App.tsx
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, Text, Button, StyleSheet } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';

import { RootNavigator } from './src/navigation/RootNavigator';
import { SyncRunner } from './src/infra/sync/sync.runner';
import { LeadsProvider } from './src/state/LeadsContext';
import { initDb } from './src/infra/db/db';
import { runMigrations } from './src/infra/db/migrations';

/**
 * شاشة بديلة تظهر في حال حدوث خطأ برمجي كارثي لمنع الشاشة البيضاء
 */
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>عذراً، حدث خطأ غير متوقع</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <View style={styles.errorButton}>
        <Button title="إعادة المحاولة" onPress={resetErrorBoundary} color="#2563eb" />
      </View>
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function start() {
      try {
        await initDb(); 
        await runMigrations(); // تشغيل الهجرات بعد initDb
        setReady(true);
      } catch (e) {
        console.error("Critical Start Error:", e);
        // حتى لو فشل الـ DB، نضبط Ready ليقوم ErrorBoundary بالتقاط الخطأ وعرضه للمستخدم
        setReady(true); 
      }
    }
    start();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback} 
        onReset={() => {
          // يمكن إضافة منطق هنا لإعادة تحميل البيانات أو مسح الكاش
          setReady(false);
          setTimeout(() => setReady(true), 100);
        }}
      >
        <LeadsProvider>
          <SyncRunner />
          <RootNavigator />
        </LeadsProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20
  },
  errorButton: {
    width: '100%',
    paddingHorizontal: 50
  }
});