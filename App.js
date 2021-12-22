import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FavoriteScreen from './FavoriteScreen';
import MapScreen from './MapScreen';
import ImageScreen from './ImageScreen';
import ListScreen from './ListScreen';

const MapStack = createNativeStackNavigator();

function MapStackScreen() {
  return (
    <MapStack.Navigator>
      <MapStack.Screen name="MapStack" component={MapScreen} options={{headerShown: false}}/>
      <MapStack.Screen name="Image" component={ImageScreen} />
      <MapStack.Screen name="List" component={ListScreen} />
    </MapStack.Navigator>
  );
}

const FavoriteStack = createNativeStackNavigator();

function FavoriteStackScreen() {
  return (
    <FavoriteStack.Navigator>
      <FavoriteStack.Screen name="Your favorites" component={FavoriteScreen} />
      <FavoriteStack.Screen name="Image" component={ImageScreen} />
    </FavoriteStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Map') {
              iconName = 'map';
            } else if (route.name === 'Favorites') {
              iconName = 'heart';
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: 'black',
          headerShown: false
        })}>
        <Tab.Screen name="Map" component={MapStackScreen} />
        <Tab.Screen name="Favorites" component={FavoriteStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );

}