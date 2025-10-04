import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChecklistScreen from '../screens/onboarding/ChecklistScreen';

const Stack = createNativeStackNavigator();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Checklist" component={ChecklistScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;