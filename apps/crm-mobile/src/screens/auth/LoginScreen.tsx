import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { 
  KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, 
  StyleSheet, Text, TextInput, TouchableOpacity, View 
} from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { Checkbox } from '../../components/ui/Checkbox';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SocialBlock } from '../../components/ui/SocialBlock';
import type { ScreenProps } from '../../navigation/types';
import { useAuth } from '../../state/AuthContext';

export function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const { state, actions } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [isEnterprise, setIsEnterprise] = useState(false);

  useEffect(() => {
    actions.clearError();
  }, [actions]);

  const canSubmit = email.includes('@') && password.length >= 1;

  async function onLogin() {
    console.log('🔘 [UI] Login button pressed');
    
    if (!canSubmit) {
        console.warn('⚠️ [UI] Validation failed (Email/Pass empty)');
        return;
    }
    
    if (isLoading) return;

    setIsLoading(true);
    actions.clearError(); 
    
    try {
      console.log('📡 [UI] Calling actions.login...');
      await actions.login({ email: email.trim().toLowerCase(), password });
      console.log('✅ [UI] Login action completed successfully');
    } catch (e: any) {
      console.error('❌ [UI] Login Error Caught in Component:', e.message); 
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
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
                        action={{ label: 'Dismiss', onPress: actions.clearError }}
                    />
                    </View>
                )}

                <View style={styles.logoArea}>
                    <Ionicons name="hourglass" size={48} color="#F36E27" />
                </View>

                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Login to continue</Text>

                <SocialBlock />

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>or</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.form}>
                    <TextInput
                    value={email}
                    onChangeText={(t) => { setEmail(t); actions.clearError(); }} 
                    placeholder="Email Address"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    />

                    <View style={styles.passContainer}>
                    <TextInput
                        value={password}
                        onChangeText={(t) => { setPassword(t); actions.clearError(); }}
                        placeholder="Password"
                        secureTextEntry={secureText}
                        style={styles.input}
                        autoComplete="password"
                        textContentType="password"
                    />
                    <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                        <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    </View>

                    <Checkbox 
                        label="Enterprise login" 
                        checked={isEnterprise} 
                        onChange={setIsEnterprise} 
                    />

                    <PrimaryButton 
                        label="Login" 
                        onPress={() => void onLogin()} 
                        loading={isLoading}
                        disabled={!canSubmit}
                    />

                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.centerBtn}>
                    <Text style={styles.forgotText}>Forgot your password?</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.footerRow}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>Sign up</Text>
                    </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  
  header: { alignItems: 'flex-start', marginBottom: 10 },
  backBtn: { padding: 4 },
  
  errorContainer: { marginBottom: 16 },

  logoArea: { alignItems: 'center', marginBottom: 16 },

  title: { fontSize: 16, textAlign: 'center', color: '#6B7280', marginBottom: 4 },
  subtitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: 32 },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { marginHorizontal: 16, color: '#9CA3AF', fontSize: 14 },

  form: { gap: 16 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  passContainer: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 14, top: 14 },

  centerBtn: { alignItems: 'center', marginTop: 8 },
  forgotText: { color: '#F36E27', fontWeight: '500' },
  
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B7280' },
  linkText: { color: '#F36E27', fontWeight: '700' },
});