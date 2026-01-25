// apps/crm-mobile/src/components/ui/PrimaryButton.tsx

import React from 'react';
import type { ViewStyle } from 'react-native';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  // ✅ 1. توسيع الأنواع هنا لتطابق StickyFooter
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const baseStyle = styles[variant];
  // استخدام "as any" هنا مؤقتاً لتجنب تعقيدات الـ Index Signature في TypeScript مع الستايلات الديناميكية
  // أو ببساطة التأكد أن كل variant له Text style مقابل
  const textStyle = styles[`${variant}Text` as keyof typeof styles];

  // تحديد لون التحميل بناءً على الخلفية
  const isDarkBg = variant === 'primary' || variant === 'danger';
  const loaderColor = isDarkBg ? '#ffffff' : '#2563eb';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        baseStyle,
        disabled && styles.disabled,
        style
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text style={[styles.textBase, textStyle, disabled && styles.disabledText]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  textBase: { fontSize: 16, fontWeight: '600' },
  
  // Primary
  primary: { backgroundColor: '#2563eb' },
  primaryText: { color: '#ffffff' },

  // Secondary
  secondary: { backgroundColor: '#eff6ff' },
  secondaryText: { color: '#1d4ed8' },

  // Outline
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#d1d5db' },
  outlineText: { color: '#374151' },

  // ✅ Ghost (بدون خلفية أو حدود)
  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: '#6b7280' },

  // ✅ Danger (للأزرار الخطرة مثل الحذف أو الإنهاء)
  danger: { backgroundColor: '#dc2626' }, // Red-600
  dangerText: { color: '#ffffff' },

  // Disabled
  disabled: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', borderWidth: 1 },
  disabledText: { color: '#9ca3af' },
});