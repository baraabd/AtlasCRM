import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { migrate, openDb } from './src/infra/db/db';

export default function App() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const db = await openDb();
      await migrate(db);
      setReady(true);
    })().catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      // eslint-disable-next-line no-console
      console.error(e);
    });
  }, []);

  return (
    <View style={styles.container}>
      {err ? (
        <>
          <Text style={styles.title}>Startup error</Text>
          <Text style={styles.text}>{err}</Text>
        </>
      ) : (
        <Text style={styles.text}>{ready ? 'CRM Mobile Ready' : 'Initializing…'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  text: { fontSize: 16, fontWeight: '600', textAlign: 'center', paddingHorizontal: 16 },
});
