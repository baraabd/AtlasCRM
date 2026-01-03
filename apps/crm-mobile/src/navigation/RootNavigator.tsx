import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';



import { CreateDealScreen } from '../screens/app/CreateDealScreen';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { DealDetailsScreen } from '../screens/app/DealDetailsScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { SelectLeadScreen } from '../screens/app/SelectLeadScreen';
import { StartVisitProofScreen } from '../screens/app/StartVisitProofScreen';
import { VisitLiveScreen } from '../screens/app/VisitLiveScreen';


import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SelectLead" component={SelectLeadScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StartVisitProof" component={StartVisitProofScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VisitLive" component={VisitLiveScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateDeal" component={CreateDealScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DealDetails" component={DealDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
