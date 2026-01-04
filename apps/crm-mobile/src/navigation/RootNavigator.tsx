import { NavigationContainer } from '@react-navigation/native';
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
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        <Stack.Screen name="SelectLead" component={SelectLeadScreen} options={{ title: 'Start Visit' }} />
        <Stack.Screen name="NewLead" component={NewLeadScreen} options={{ title: 'New Lead' }} />

        <Stack.Screen name="StartVisitProof" component={StartVisitProofScreen} options={{ title: 'Start Visit Proof' }} />
        <Stack.Screen name="VisitLive" component={VisitLiveScreen} options={{ title: 'Visit Live' }} />
        <Stack.Screen name="EndVisit" component={EndVisitScreen} options={{ title: 'End Visit' }} />

        <Stack.Screen name="CreateDeal" component={CreateDealScreen} options={{ title: 'Create Deal' }} />
        <Stack.Screen name="DealDetails" component={DealDetailsScreen} options={{ title: 'Deal Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}