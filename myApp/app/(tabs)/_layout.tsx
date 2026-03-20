import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useAccessibility } from '@/contexts/accessibility-context';

export default function TabLayout() {
  const { blindModeEnabled } = useAccessibility();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#1677FF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 74,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(20, 32, 50, 0.08)',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Маршруты',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trail-sign-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="risks"
        options={{
          title: 'Риски',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="city"
        options={{
          title: 'Город',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vision"
        options={{
          href: blindModeEnabled ? undefined : null,
          title: 'Зрение',
          tabBarIcon: ({ color, size }) => <Ionicons name="eye-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
