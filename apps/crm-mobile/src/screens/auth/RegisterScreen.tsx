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

export function RegisterScreen({ navigation }: ScreenProps<'Register'>) {
  const { state, actions } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    actions.clearError();
  }, [actions]);

  const canSubmit = fullName.length > 2 && email.length > 3 && password.length >= 6 && agreeTerms;

  async function onRegister() {
    if (isLoading) return;
    setIsLoading(true);
    actions.clearError();

    try {
      await actions.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });
    } catch {
       // Error handled in Context
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.container}
      >
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

          <Text style={styles.title}>Create a new account</Text>

          <SocialBlock />

          <Text style={styles.orText}>or</Text>

          <View style={styles.form}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full name"
              style={styles.input}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />

            <View style={styles.tabsWrapper}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'email' && styles.activeTab]}
                onPress={() => setActiveTab('email')}
              >
                <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
                onPress={() => setActiveTab('phone')}
              >
                <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>Phone number</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); actions.clearError(); }}
              placeholder={activeTab === 'email' ? "Email" : "Phone number"}
              style={styles.input}
              autoCapitalize="none"
              keyboardType={activeTab === 'email' ? "email-address" : "phone-pad"}
              autoComplete={activeTab === 'email' ? "email" : "tel"} 
              textContentType={activeTab === 'email' ? "emailAddress" : "telephoneNumber"}
            />

            <View style={styles.passContainer}>
               <TextInput
                 value={password}
                 onChangeText={(t) => { setPassword(t); actions.clearError(); }}
                 placeholder="Set up password"
                 secureTextEntry
                 style={styles.input}
                 autoComplete="password-new"
                 textContentType="newPassword"
               />
               <Ionicons name="eye-off-outline" size={20} color="#9CA3AF" style={styles.eyeIcon} />
            </View>

            <View style={styles.spacer} />

            <Checkbox 
               label="I agree to receive offers, tips and product updates sent by Jibble."
               checked={agreeMarketing}
               onChange={setAgreeMarketing}
            />

            <Checkbox 
               label="I agree to Company's Terms of Service & Privacy Policy."
               checked={agreeTerms}
               onChange={setAgreeTerms}
               highlightLink={{
                 text: "Terms of Service & Privacy Policy",
                 onPress: () => console.log('Open Terms')
               }}
            />

            <View style={styles.spacer} />

            <PrimaryButton 
               label="Next" 
               onPress={() => void onRegister()}
               loading={isLoading}
               disabled={!canSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  header: { marginBottom: 20 },
  backBtn: { alignSelf: 'flex-start', padding: 4 },
  
  errorContainer: { marginBottom: 16 },

  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#111827' },
  orText: { textAlign: 'center', color: '#9CA3AF', marginBottom: 20, fontSize: 14 },

  form: { gap: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  
  tabsWrapper: { 
    flexDirection: 'row', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    overflow: 'hidden', 
    marginBottom: 4 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: { 
    backgroundColor: '#fff', 
    borderBottomColor: '#F36E27' 
  },
  tabText: { color: '#9CA3AF', fontWeight: '600' },
  activeTabText: { color: '#F36E27' },

  passContainer: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 14, top: 16 },
  
  spacer: { height: 12 },
});