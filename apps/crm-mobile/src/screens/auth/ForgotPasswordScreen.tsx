import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, TextInput, View, TouchableOpacity, 
  SafeAreaView, KeyboardAvoidingView, Platform 
} from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuth } from '../../state/AuthContext';
import type { ScreenProps } from '../_types';

export function ForgotPasswordScreen({ navigation }: ScreenProps<'ForgotPassword'>) {
  const { state, actions } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    actions.clearError();
  }, [actions]);

  async function onRequestOtp() {
    if (!email.includes('@') || isLoading) return;
    setIsLoading(true);
    actions.clearError();
    try {
      await actions.forgotPassword(email.trim().toLowerCase());
      setStep(2);
    } catch {
      // Error in context
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetPassword() {
    if (otp.length < 4 || newPassword.length < 6 || isLoading) return;
    setIsLoading(true);
    actions.clearError();
    try {
      await actions.resetPassword(email.trim().toLowerCase(), otp, newPassword);
      setSuccessMsg('Password changed successfully! You can now login.');
    } catch {
      // Error in context
    } finally {
      setIsLoading(false);
    }
  }

  if (successMsg) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.iconCircle}>
             <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
          </View>
          <Text style={styles.title}>Success!</Text>
          <Text style={styles.subtitle}>{successMsg}</Text>
          <PrimaryButton 
            label="Back to Login" 
            onPress={() => navigation.navigate('Login')} 
            style={styles.fullWidthBtn}
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
            <View style={styles.bannerContainer}>
              <Banner variant="error" text={state.error} action={{ label: 'Dismiss', onPress: actions.clearError }} />
            </View>
        )}

        <View style={styles.content}>
          <View style={styles.logoArea}>
             <Ionicons name="lock-closed-outline" size={40} color="#F36E27" />
          </View>

          {step === 1 ? (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter your email to receive a verification code.</Text>
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
                />
                <View style={styles.spacer} />
                <PrimaryButton 
                  label="Send Code" 
                  onPress={() => void onRequestOtp()} 
                  loading={isLoading}
                  disabled={!email.includes('@')}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Verify & Reset</Text>
              <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
              <View style={styles.form}>
                <Text style={styles.label}>OTP Code</Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="e.g. 1234"
                  keyboardType="number-pad"
                  style={styles.input}
                  maxLength={6}
                />
                <View style={styles.spacer} />
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholder="Min 6 chars"
                />
                <View style={styles.spacer} />
                <PrimaryButton 
                  label="Change Password" 
                  onPress={() => void onResetPassword()} 
                  loading={isLoading}
                  disabled={otp.length < 4 || newPassword.length < 6}
                />
                 <TouchableOpacity onPress={() => setStep(1)} style={styles.linkBtn}>
                  <Text style={styles.linkText}>Change email?</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24 },
  header: { marginBottom: 10 },
  backBtn: { alignSelf: 'flex-start', padding: 4 },
  bannerContainer: { marginBottom: 16 },
  content: { flex: 1, paddingTop: 20 },
  logoArea: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 14, fontSize: 16, color: '#1F2937' },
  spacer: { height: 16 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  fullWidthBtn: { marginTop: 24, width: '100%' },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6B7280', textDecorationLine: 'underline' },
});