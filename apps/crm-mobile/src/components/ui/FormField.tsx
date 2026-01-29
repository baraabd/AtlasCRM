import React, { useState } from 'react';
import { 
  StyleSheet, Text, TextInput, View, TextInputProps, 
  StyleProp, ViewStyle, TextStyle 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// =================================================================
// 1. Atoms (Internal)
// =================================================================

function FormLabel({ text, style }: { text: string; style?: TextStyle }) {
  return <Text style={[styles.label, style]}>{text}</Text>;
}

function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
}

function InputIcon({ name, isFocused }: { name: keyof typeof Ionicons.glyphMap; isFocused: boolean }) {
  return (
    <Ionicons
      name={name}
      size={20}
      color={isFocused ? '#F36E27' : '#6B7280'}
      style={styles.icon}
    />
  );
}

// =================================================================
// 2. Main Component (Fixed)
// =================================================================

const COLORS = {
  primary: '#F36E27',
  border: '#E5E7EB',
  inputBg: '#FFFFFF',
  textDark: '#111827',
};

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string | null;
}

export function FormField({ 
  label, 
  icon, 
  containerStyle, 
  error,
  style,
  ...props // نستقبل كل الخصائص الأخرى (بما فيها onBlur القادمة من الشاشة)
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      
      <FormLabel text={label} />
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        !!error && styles.inputWrapperError
      ]}>
        {icon && <InputIcon name={icon} isFocused={isFocused} />}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#9CA3AF"
          // ✅ نضع الخصائص العامة أولاً
          {...props}

          // ✅ ثم نكتب الدوال الخاصة بنا مع دمج (Chain) الدوال القادمة من الخارج
          onFocus={(e) => {
            setIsFocused(true);       // 1. منطق التصميم الداخلي
            props.onFocus?.(e);       // 2. منطق الشاشة الخارجي (إن وجد)
          }}
          onBlur={(e) => {
            setIsFocused(false);      // 1. إرجاع اللون للرمادي
            props.onBlur?.(e);        // 2. ✅ تشغيل دالة التحقق handleNameBlur
          }}
        />
      </View>
      
      {/* عرض الخطأ إن وجد */}
      <FormError message={error} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: '600', color: COLORS.textDark,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    height: 52, paddingHorizontal: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  inputWrapperFocused: { borderColor: COLORS.primary, backgroundColor: '#FFF7ED' },
  inputWrapperError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }, // لون خلفية خفيف عند الخطأ
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 16, color: COLORS.textDark },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 2 },
});