import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorDashboard from './src/Components/DoctorDashboard';
import PatientDashboard from './src/Components/PatientDashboard';
import ResetPassword from './src/Components/ResetPassword';
import PatientRegistration from './src/Components/PatientRegistration';
import FirstScreen from './src/Components/FirstScreen';
import LoginDoctor from './src/Components/LoginDoctor';
import LoginPatient from './src/Components/LoginPatient';
import ChangePassword from './src/Components/ChangePassword';
import Game from './src/Components/Game';
import DeepBreathing from './src/Components/DeepBreathing';
import Meditation from './src/Components/Meditation';
import Journaling from './src/Components/Journaling';
import WeeklyTasks from './src/Components/WeeklyTasks';
import SecretWordGame from './src/Components/SecretWordGame';
import ViewTasksScreen from './src/Components/ViewTasksScreen';
import { UserDataProvider } from './src/Components/UserDataManager';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [userUid, setUserUid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [provisionalPassword, setProvisionalPassword] = useState(false);

  useEffect(() => {
    // Retrieving user role in App.js
    const checkUserToken = async () => {
      console.log('Checking user token...');
      try {
        const userToken = await ReactNativeAsyncStorage.getItem('userToken');
        const role = await ReactNativeAsyncStorage.getItem('userRole');

        console.log('User token from AsyncStorage:', userToken);
        console.log('User role from AsyncStorage:', role);

        if (userToken && role) {
          setUserUid(userToken);
          setUserRole(role);
          console.log('User token found in AsyncStorage:', userToken);
        }

        // Check if provisional password needs to be set
        const provisionalPasswordValue = await ReactNativeAsyncStorage.getItem('provisionalPassword');
        if (provisionalPasswordValue === 'true') {
          setProvisionalPassword(true);
        }

      } catch (error) {
        console.error('Error reading user token from AsyncStorage:', error);
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
      <UserDataProvider>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={
            userRole === 'doctor' ? 'DoctorDashboard' :
              userRole === 'patient' ? (provisionalPassword ? 'ChangePassword' : 'PatientDashboard') :
                'FirstScreen'
          }
        >
          <Stack.Screen name="FirstScreen" component={FirstScreen} />
          <Stack.Screen name="LoginDoctor" component={LoginDoctor} />
          <Stack.Screen name="LoginPatient" component={LoginPatient} />
          <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
          <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
          <Stack.Screen name="PatientRegistration" component={PatientRegistration} />
          <Stack.Screen name="ChangePassword">
            {props => <ChangePassword {...props} setProvisionalPassword={setProvisionalPassword} />}
          </Stack.Screen>
          <Stack.Screen name="Game" component={Game} />
          <Stack.Screen name="DeepBreathing" component={DeepBreathing} />
          <Stack.Screen name="Meditation" component={Meditation} />
          <Stack.Screen name="Journaling" component={Journaling} />
          <Stack.Screen name="WeeklyTasks" component={WeeklyTasks} />
          <Stack.Screen name="SecretWordGame" component={SecretWordGame} />
          <Stack.Screen name="ViewTasksScreen" component={ViewTasksScreen} />
        </Stack.Navigator>
      </UserDataProvider>
    </NavigationContainer>
  );
}