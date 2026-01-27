import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuth } from '../../state/AuthContext';
import type { ScreenProps } from '../_types';

export function ForgotPasswordScreen({ navigation }: ScreenProps<'ForgotPassword'>) {
  const { state, actions } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    actions.clearError();
  }, [actions]); // ✅ تمت إضافة actions هنا

  async function onSubmit() {
    if (!email.includes('@') || isLoading) return;
    setIsLoading(true);
    actions.clearError();
    try {
      await actions.forgotPassword(email);
      setIsSent(true);
    } catch {
      // Error handled in Context
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.iconCircle}>
             <Ionicons name="mail-open-outline" size={40} color="#F36E27" />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We've sent password reset instructions to {email}
          </Text>
          
          <PrimaryButton 
            label="Back to Login" 
            onPress={() => navigation.navigate('Login')} 
            style={styles.backToLoginBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
             <Ionicons name="arrow-back" size={24} color="#111827" />
           </TouchableOpacity>
        </View>

        {!!state.error && (
            <View style={styles.errorContainer}>
              <Banner 
                variant="error" 
                text={state.error} 
                action={{ label: 'Retry', onPress: actions.clearError }}
              />
            </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); actions.clearError(); }}
              placeholder="name@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              autoComplete="email"
              textContentType="emailAddress"
            />

            <View style={styles.spacer} />

            <PrimaryButton 
              label="Send Reset Link" 
              onPress={() => void onSubmit()} 
              loading={isLoading}
              disabled={!email.includes('@')}
            />
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24 },
  header: { marginBottom: 20 },
  backBtn: { alignSelf: 'flex-start', padding: 4 },
  
  errorContainer: { marginBottom: 16 },

  content: { flex: 1, justifyContent: 'center', paddingBottom: 100 },
  
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 22 },

  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  spacer: { height: 16 },

  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24
  },
  backToLoginBtn: { marginTop: 24, width: '100%' }
});