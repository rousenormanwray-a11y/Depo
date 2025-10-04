import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MarketplaceStackParamList } from '../types';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import ItemDetailScreen from '../screens/marketplace/ItemDetailScreen';
import CheckoutScreen from '../screens/marketplace/CheckoutScreen';
import RedemptionHistoryScreen from '../screens/marketplace/RedemptionHistoryScreen';

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

const MarketplaceNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MarketplaceScreen" component={MarketplaceScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="RedemptionHistory" component={RedemptionHistoryScreen} />
    </Stack.Navigator>
  );
};

export default MarketplaceNavigator;