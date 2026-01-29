import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';


// Auth Screens

// App Screens
import { CreateDealScreen } from '../screens/app/CreateDealScreen';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { DealDetailsScreen } from '../screens/app/DealDetailsScreen';
import { NewLeadScreen } from '../screens/app/NewLeadScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { SelectLeadScreen } from '../screens/app/SelectLeadScreen';
import { StartVisitProofScreen } from '../screens/app/StartVisitProofScreen';
import { VisitLiveScreen } from '../screens/app/VisitLiveScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { TenantSelectScreen } from '../screens/auth/TenantSelectScreen';
import { useAuth } from '../state/AuthContext';

import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function RootNavigator() {
  const { state } = useAuth();

  useEffect(() => {
     // Splash logic here if needed
  }, []);

  if (state.status === 'booting') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {state.status === 'signedOut' ? (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Group>
        ) : state.status === 'needsTenant' ? (
          <Stack.Screen name="TenantSelect" component={TenantSelectScreen} />
        ) : (
          <Stack.Group>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="SelectLead" component={SelectLeadScreen} />
            <Stack.Screen name="NewLead" component={NewLeadScreen} />
            <Stack.Screen name="StartVisitProof" component={StartVisitProofScreen} />
            <Stack.Screen name="VisitLive" component={VisitLiveScreen} />
            <Stack.Screen name="CreateDeal" component={CreateDealScreen} />
            <Stack.Screen name="DealDetails" component={DealDetailsScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});