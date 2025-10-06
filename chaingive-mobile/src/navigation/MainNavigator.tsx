import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { MainTabParamList } from '../types';
import { RootState } from '../store/store';
import { colors } from '../theme/colors';
import HomeNavigator from './HomeNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import ProfileNavigator from './ProfileNavigator';
import AgentNavigator from './AgentNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAgent = user?.isAgent;

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

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border.light,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceNavigator}
        options={{ tabBarLabel: 'Marketplace' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
      {isAgent && (
        <Tab.Screen 
          name="Agent" 
          component={AgentNavigator}
          options={{ tabBarLabel: 'Agent' }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator;