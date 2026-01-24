/* import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { AppStackParamList } from '../screens/_types';
import { CreateDealScreen } from '../screens/app/CreateDealScreen';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { DealDetailsScreen } from '../screens/app/DealDetailsScreen';
import { EndVisitScreen } from '../screens/app/EndVisitScreen';
import { NewLeadScreen } from '../screens/app/NewLeadScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { SelectLeadScreen } from '../screens/app/SelectLeadScreen';
import { StartVisitProofScreen } from '../screens/app/StartVisitProofScreen';
import { VisitLiveScreen } from '../screens/app/VisitLiveScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: 'left',
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="SelectLead" component={SelectLeadScreen} options={{ title: 'Start Visit' }} />
        <Stack.Screen name="NewLead" component={NewLeadScreen} options={{ title: 'New Lead' }} />
        <Stack.Screen name="StartVisitProof" component={StartVisitProofScreen} options={{ title: 'Start Visit Proof' }} />
        <Stack.Screen name="VisitLive" component={VisitLiveScreen} options={{ title: 'Visit Live' }} />
        <Stack.Screen name="EndVisit" component={EndVisitScreen} options={{ title: 'End Visit' }} />
        <Stack.Screen name="CreateDeal" component={CreateDealScreen} options={{ title: 'Create Deal' }} />
        <Stack.Screen name="DealDetails" component={DealDetailsScreen} options={{ title: 'Deal Details' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
 */


// apps/crm-mobile/src/navigation/RootNavigator.tsx

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import type { AppStackParamList } from '../screens/_types';

// Auth Screens

// App Screens
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { NewLeadScreen } from '../screens/app/NewLeadScreen';
import { SelectLeadScreen } from '../screens/app/SelectLeadScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { TenantSelectScreen } from '../screens/auth/TenantSelectScreen';
import { useAuth } from '../state/AuthContext';
// ... import other screens

const Stack = createNativeStackNavigator<AppStackParamList>();

export function RootNavigator() {
  const { state } = useAuth();

  if (state.status === 'booting') {
    return (
      <View style={styles.centered}>
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
          <Stack.Group screenOptions={{ presentation: 'fullScreenModal', headerShown: true }}>
            <Stack.Screen 
              name="TenantSelect" 
              component={TenantSelectScreen} 
              options={{ title: 'Select Organization', headerLeft: () => null }} 
            />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ headerShown: true }}>
             <Stack.Screen name="Dashboard" component={DashboardScreen} />
             <Stack.Screen name="SelectLead" component={SelectLeadScreen} />
             <Stack.Screen name="NewLead" component={NewLeadScreen} />
             {/* Add other screens here */}
          </Stack.Group>
        )}
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});