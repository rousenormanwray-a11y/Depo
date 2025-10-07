import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { MainTabParamList } from '../types';
import { RootState } from '../store/store';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import HomeNavigator from './HomeNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import ProfileNavigator from './ProfileNavigator';
import AgentNavigator from './AgentNavigator';
import DailyMissionsScreen from '../screens/gamification/DailyMissionsScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import ReferralScreen from '../screens/referral/ReferralScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAgent = user?.isAgent;

  const handleTabPress = () => {
    // Add haptic feedback on tab press
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Missions':
              iconName = 'check-circle';
              break;
            case 'Leaderboard':
              iconName = 'emoji-events';
              break;
            case 'Marketplace':
              iconName = 'store';
              break;
            case 'Referral':
              iconName = 'people';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'Agent':
              iconName = 'work';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={focused ? 26 : 24} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: colors.white,
          borderRadius: 16,
          height: 70,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          ...shadows.floating,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -5,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator}
        options={{ tabBarLabel: 'Home' }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen 
        name="Missions" 
        component={DailyMissionsScreen}
        options={{ tabBarLabel: 'Missions' }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ tabBarLabel: 'Leaderboard' }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceNavigator}
        options={{ tabBarLabel: 'Marketplace' }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen 
        name="Referral" 
        component={ReferralScreen}
        options={{ tabBarLabel: 'Referral' }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{ tabBarLabel: 'Profile' }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      {isAgent && (
        <Tab.Screen 
          name="Agent" 
          component={AgentNavigator}
          options={{ tabBarLabel: 'Agent' }}
          listeners={{
            tabPress: handleTabPress,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator;