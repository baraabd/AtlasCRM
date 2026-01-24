// apps/crm-mobile/src/screens/auth/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Keyboard } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { authApi } from '../../infra/api/auth';
import type { ScreenProps } from '../_types';

export function ForgotPasswordScreen({ navigation }: ScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (status === 'loading') return;
    Keyboard.dismiss();
    setStatus('loading');
    try {
      await authApi.forgotPassword(email.trim());
      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'Failed to send reset link.');
    }
  };

  const footer = (
    <StickyFooter
      secondary={{
        label: 'Back to Login',
        variant: 'outline',
        onPress: () => navigation.goBack(),
      }}
      primary={status !== 'success' ? {
        label: status === 'loading' ? 'Sending...' : 'Send Reset Link',
        variant: 'primary',
        disabled: !email.includes('@') || status === 'loading',
        onPress: handleSubmit,
      } : undefined}
    />
  );

  return (
    <Screen title="Reset Password" footer={footer}>
      {status === 'success' && (
        <Banner variant="success" text="Check your email for the reset link." />
      )}
      {status === 'error' && (
        <Banner variant="error" text={errorMsg} />
      )}

      {status !== 'success' && (
        <Card>
          <Text style={styles.text}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={(t) => {
                 setEmail(t);
                 if(status === 'error') setStatus('idle');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@company.com"
              style={styles.input}
            />
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { color: '#4b5563', marginBottom: 16, lineHeight: 20 },
  field: { marginTop: 8 },
  label: { marginBottom: 6, fontWeight: '500', color: '#374151' },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 12, backgroundColor: '#fff', fontSize: 16
  },
});