// apps/crm-mobile/src/components/domain/FollowUpRow.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import type { FollowUp } from '../../types/domain';
import { Card } from '../ui/Card';

export function FollowUpRow({ item, onPress }: { item: FollowUp; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.type}>{item.type} • {new Date(item.at).toLocaleTimeString()}</Text>
          </View>
          <View style={styles.icon}>
            <Text>👉</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '600', color: '#111827' },
  type: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  icon: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 8 },
});