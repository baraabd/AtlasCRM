// apps/crm-mobile/src/components/layout/StickyFooter.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { PrimaryButton } from '../ui/PrimaryButton';

export type Action = {
  label: string;
  onPress: () => void;
  // ✅ الآن هذا النوع متطابق تماماً مع PrimaryButton
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
};

export type StickyFooterProps = {
  primary?: Action;
  secondary?: Action;
  actions?: Action[]; 
};

export function StickyFooter({ primary, secondary, actions }: StickyFooterProps) {
  // المنطق: إذا تم تمرير actions، الزر الأول هو الرئيسي (يمين)، والثاني هو الثانوي (يسار)
  const mainAction = primary || (actions && actions[0]);
  const subAction = secondary || (actions && actions[1]);

  return (
    <View style={styles.container}>
      {/* الزر الثانوي (على اليسار) */}
      {subAction && (
        <View style={styles.btnWrapper}>
          <PrimaryButton 
            {...subAction} 
            // إذا لم يتم تحديد variant، نستخدم 'outline' للزر الثانوي
            variant={subAction.variant || 'outline'} 
          />
        </View>
      )}

      {/* مسافة بين الزرين */}
      {subAction && mainAction && <View style={styles.spacer} />}

      {/* الزر الرئيسي (على اليمين) */}
      {mainAction && (
        <View style={styles.btnWrapper}>
          <PrimaryButton 
            {...mainAction} 
            // إذا لم يتم تحديد variant، نستخدم 'primary' للزر الرئيسي
            variant={mainAction.variant || 'primary'} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 24, 
  },
  btnWrapper: { flex: 1 },
  spacer: { width: 12 },
});