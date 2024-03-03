//Login.js

import React, { Component, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db, signInWithEmailAndPassword } from '../config/firebase'; // Adjust the import
import { doc, getDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './UserDataManager';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const { updateUserData } = useUserData();

  const signIn = async () => {
    setLoading(true);
    try {
      console.log('Signing in');
      const response = await signInWithEmailAndPassword(auth, email, password);

      // Retrieve user data from Firestore based on the user's UID
      const docRef = doc(db, 'users', response.user.uid);

      const userDoc = await getDoc(docRef);
      const userData = userDoc.data();
      console.log('User Role:', userData.role);

      // Update user data context
      updateUserData({ uid: response.user.uid });


      // Store user authentication token, role, and display name in AsyncStorage
      await ReactNativeAsyncStorage.setItem('userToken', response.user.uid);
      console.log('User Token saved!');
      await ReactNativeAsyncStorage.setItem('userRole', userData.role);

      // Navigate to the appropriate dashboard based on the user's role
      if (userData.role === 'patient') {
        console.log('Navigating to PatientDashboard');
        navigation.navigate('PatientDashboard');
      } else if (userData.role === 'doctor') {
        console.log('Navigating to DoctorDashboard');
        navigation.navigate('DoctorDashboard');
      }

      alert('User logged-in successfully');
      setLoading(false);

    } catch (error) {
      console.log(error);
      alert(error.message);
      setLoading(false);
    }
  };


  return (

    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} >

        <Image
          source={require('../logo3.png')}
          style={styles.img}
        />


        <Text style={styles.introduction}>Hello There! </Text>


        <View style={styles.form}>

          <Text style={styles.label}>Username: </Text>

          <TextInput
            placeholder="Enter your Email Address"
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
          />

          <Text style={styles.label}> Password: </Text>

          <TextInput
            placeholder="Enter your password"
            secureTextEntry
            style={styles.input}
            onChangeText={(text) => setPassword(text)}
          />

          <View style={styles.resetArea}>
            <TouchableOpacity style={styles.resetBtn}>


              <Text style={styles.resetText}>Forgot your Password?</Text>
            </TouchableOpacity>

          </View>



          <TouchableOpacity style={styles.btn} onPress={signIn}>
            <View style={styles.btnArea}>
              <Text style={styles.btnText}>Login</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
  },
  img: {
    width: 250,
    height: 250,
    marginBottom: 20,
    alignSelf: 'center',
  },
  introduction: {
    fontSize: 20,
    color: 'black',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',

  },
  form: {
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1.5,
    width: 300,
    borderColor: 'black',
    padding: 10,
    borderRadius: 7,
    marginBottom: 15,
  },
  btn: {
    width: 150,
    height: 50,
    backgroundColor: '#052458',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    opacity: 0.9,
  },
  resetText: {
    fontSize: 14,
    color: 'black',
    marginBottom: 50,
    fontStyle: 'italic',
    alignSelf: 'flex-end', // Align the text to the end of its container
    textAlign: 'right', // Align the text to the right within its container
  },
  resetArea: {
    alignSelf: 'flex-end', // Align the container to the end of its parent
    flexDirection: 'row', // Set the direction of the container to row
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Login;