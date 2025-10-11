import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AgentStackParamList } from '../types';
import AgentDashboardScreen from '../screens/agent/AgentDashboardScreen';
import VerifyUserScreen from '../screens/agent/VerifyUserScreen';
import CashDepositScreen from '../screens/agent/CashDepositScreen';
import VerificationDetailScreen from '../screens/agent/VerificationDetailScreen';
import BuyCoinsWithCryptoScreen from '../screens/agent/BuyCoinsWithCryptoScreen';
import ConfirmCoinPaymentScreen from '../screens/agent/ConfirmCoinPaymentScreen';
import PendingCoinPurchasesScreen from '../screens/wallet/PendingCoinPurchasesScreen';

const Stack = createNativeStackNavigator<AgentStackParamList>();

const AgentNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AgentDashboard" component={AgentDashboardScreen} />
      <Stack.Screen name="VerifyUser" component={VerifyUserScreen} />
      <Stack.Screen name="CashDeposit" component={CashDepositScreen} />
      <Stack.Screen name="VerificationDetail" component={VerificationDetailScreen} />
    </Stack.Navigator>
  );
};

export default AgentNavigator;