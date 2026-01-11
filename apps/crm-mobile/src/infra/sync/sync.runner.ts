import * as Network from 'expo-network';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { runSyncWithRetry } from './sync.service';

async function isOnline() {
  try {
    const state = await Network.getNetworkStateAsync();
    // state.isInternetReachable can be null on some devices; treat null as "unknown but likely online if connected"
    return !!state.isConnected && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

export function SyncRunner() {
  useEffect(() => {
    // Run once on app start
    void runSyncWithRetry(3);

    // Also run when app comes to foreground (best practical trigger without NetInfo listener)
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        void (async () => {
          const online = await isOnline();
          console.log('[NET]', 'active -> online=', online);
          if (online) void runSyncWithRetry(3);
        })();
      }
    });

    return () => sub.remove();
  }, []);

  return null;
}
