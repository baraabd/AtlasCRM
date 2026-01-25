// apps/crm-mobile/src/screens/auth/LoginScreen.tsx

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Keyboard } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../state/AuthContext';
import type { ScreenProps } from '../_types';

export function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const { state, actions } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = email.includes('@') && password.length >= 6;

  async function onLogin() {
    if (!canSubmit || isLoading) return;
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await actions.login({ email: email.trim().toLowerCase(), password });
    } catch { // ✅ تجاهل الخطأ غير المستخدم
      setIsLoading(false);
    }
  }

  return (
    <Screen 
      title="Welcome Back" 
      footer={
        <StickyFooter
          secondary={{
            label: 'Create account',
            variant: 'secondary',
            onPress: () => navigation.navigate('Register'),
            disabled: isLoading
          }}
          primary={{
            label: isLoading ? 'Logging in...' : 'Login',
            variant: 'primary',
            disabled: !canSubmit || isLoading,
            onPress: () => void onLogin(),
          }}
        />
      }
    >
      {!!state.error && (
        <Banner variant="error" text={state.error} />
      )}

      <Card>
        <Text style={styles.title}>Login to your account</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={email}
            onChangeText={(v) => {
              if (state.error) actions.clearError();
              setEmail(v);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="name@company.com"
            editable={!isLoading}
            style={[styles.input, state.error ? styles.inputError : null]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(v) => {
              if (state.error) actions.clearError();
              setPassword(v);
            }}
            secureTextEntry
            placeholder="••••••••"
            editable={!isLoading}
            style={[styles.input, state.error ? styles.inputError : null]}
          />
        </View>

        <Text 
          style={styles.forgotLink} 
          onPress={() => !isLoading && navigation.navigate('ForgotPassword')}
        >
          Forgot password?
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  field: { marginTop: 16 },
  label: { marginBottom: 6, fontSize: 14, fontWeight: '500', color: '#4b5563' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  inputError: { borderColor: '#ef4444' },
  forgotLink: { marginTop: 16, fontWeight: '600', color: '#2563eb', textAlign: 'right' },
});