// apps/crm-mobile/src/screens/auth/RegisterScreen.tsx

import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';

import { Banner } from '../../components/feedback/Banner';
import { Screen } from '../../components/layout/Screen';
import { StickyFooter } from '../../components/layout/StickyFooter';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../state/AuthContext';
import type { ScreenProps } from '../_types';

type Step = 'basic' | 'documents';

export function RegisterScreen({ navigation }: ScreenProps<'Register'>) {
  const { state, actions } = useAuth();
  const [step, setStep] = useState<Step>('basic');
  const [isLoading, setIsLoading] = useState(false);
  // إضافة حالة لرسالة خطأ محلية أكثر تفصيلاً
  const [localError, setLocalError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const isBasicValid = useMemo(() => 
    fullName.trim().length >= 3 && email.includes('@') && password.length >= 6,
    [fullName, email, password]
  );

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission Required", "Allow access to photos to upload a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLocalError(null);

    try {
     
      // ✅ الحل: إرسال كائن عادي (JSON)
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        // (سنؤجل الصورة حالياً لضمان نجاح التسجيل)
      };

      console.log('🚀 Sending registration request (JSON)...', payload); 
      
      // Axios سيقوم بتحويله لـ JSON تلقائياً لأننا ضبطنا الهيدر في http.ts
      await actions.register(payload);
      
    } catch (e: any) {
      const errorDetails = {
        message: e.message,
        code: e.code,
        status: e.response?.status,
        data: e.response?.data,
        baseURL: e.config?.baseURL
      };
      
      console.error('❌ REGISTER FAILED:', JSON.stringify(errorDetails, null, 2));

      let userFriendlyMessage = e.response?.data?.message || e.message;
      
      if (e.message.includes('Network Error')) {
        userFriendlyMessage = `Cannot reach server at ${errorDetails.baseURL}. Check your IP settings.`;
      } else if (e.response?.status === 500) {
        userFriendlyMessage = "Server Error: Please check Backend Terminal for logs.";
      }

      setLocalError(userFriendlyMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <StickyFooter
      secondary={{
        label: 'Back',
        variant: 'outline',
        onPress: () => step === 'basic' ? navigation.goBack() : setStep('basic'),
        disabled: isLoading
      }}
      primary={{
        label: step === 'basic' ? 'Next Step' : (isLoading ? 'Creating...' : 'Create Account'),
        variant: 'primary',
        disabled: !isBasicValid || isLoading,
        onPress: () => step === 'basic' ? setStep('documents') : void handleRegister(),
      }}
    />
  );

  return (
    <Screen title="Create Account" footer={footer}>
      {/* عرض الخطأ المحلي أو خطأ الحالة العامة */}
      {(!!state.error || !!localError) && (
        <Banner variant="error" text={localError || state.error || 'Unknown error'} />
      )}

      <ScrollView contentContainerStyle={ styles.scrollContent }>
        {step === 'basic' ? (
          <Card>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                value={fullName} 
                onChangeText={setFullName} 
                style={styles.input} 
                placeholder="John Doe"
                editable={!isLoading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                placeholder="john@example.com"
                editable={!isLoading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                style={styles.input} 
                placeholder="Min. 6 characters"
                editable={!isLoading}
              />
            </View>
          </Card>
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>Profile Setup</Text>
            <Text style={styles.subText}>Add a profile photo to help your team identify you (Optional).</Text>

            <TouchableOpacity onPress={pickImage} style={styles.avatarUpload} disabled={isLoading}>
              {avatar ? (
                <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.plusIcon}>+</Text>
                  <Text style={styles.avatarLabel}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontWeight: '900', fontSize: 18, color: '#111827' },
  subText: { marginTop: 4, color: '#6b7280', fontSize: 14, marginBottom: 20 },
  field: { marginTop: 16 },
  label: { marginBottom: 6, color: '#374151', fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    fontSize: 16,
  },
  avatarUpload: { alignSelf: 'center', marginTop: 10 },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: { fontSize: 24, color: '#9ca3af', fontWeight: 'bold' },
  avatarLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
});