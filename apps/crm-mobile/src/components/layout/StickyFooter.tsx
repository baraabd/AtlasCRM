// apps\crm-mobile\src\components\layout\StickyFooter.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { OutlineButton } from '../../components/ui/OutlineButton';

export function StickyFooter({ actions = [] }: { actions?: any[] }) {
  if (!actions.length) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.footer}>
        {actions.map((btn, i) => {
          // اختيار المكون بناءً على النوع المذكور في الكود
          const ButtonComp = 
            btn.variant === 'secondary' ? SecondaryButton :
            btn.variant === 'outline' ? OutlineButton : 
            PrimaryButton;

          return (
            <View key={i} style={styles.flex1}>
              <ButtonComp label={btn.label} onPress={btn.onPress} />
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#fff' },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  flex1: { flex: 1 }
});