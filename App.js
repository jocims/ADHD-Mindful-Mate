// App.js

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/Components/Login';
import DoctorDashboard from './src/Components/DoctorDashboard';
import PatientDashboard from './src/Components/PatientDashboard';
import ResetPassword from './src/Components/ResetPassword';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const getDashboardRoute = (userRole) => {
  return userRole === 'doctor' ? 'DoctorDashboard' : 'PatientDashboard';
};

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [userUid, setUserUid] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUserToken = async () => {
      console.log('Checking user token...');
      try {
        const userToken = await ReactNativeAsyncStorage.getItem('userToken');
        const role = await ReactNativeAsyncStorage.getItem('userRole');

        console.log('User token from AsyncStorage:', userToken);
        console.log('Role from AsyncStorage:', role);

        if (userToken && role) {
          setUserUid(userToken);
          setUserRole(role);
          console.log('User token and role found in AsyncStorage:', userToken, role);
        }
      } catch (error) {
        console.error('Error reading user token or role from AsyncStorage:', error);
      } finally {
        setInitializing(false);
      }
    };

    checkUserToken();
  }, []);

  if (initializing) {
    // Return a loading screen or null while initializing
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={userUid && userRole ? getDashboardRoute(userRole) : 'Login'}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
        <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
