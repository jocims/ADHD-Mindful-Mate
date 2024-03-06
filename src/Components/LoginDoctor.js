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

const LoginDoctor = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const { updateUserData } = useUserData();

  const signIn = async () => {
    setLoading(true);
    try {
      console.log('Signing in as a doctor');
      const response = await signInWithEmailAndPassword(auth, email, password);

      // Retrieve user data from Firestore based on the user's UID
      const docRef = doc(db, 'doctor', response.user.uid);

      const userDoc = await getDoc(docRef);
      const userData = userDoc.data();

      // Update user data context
      updateUserData({ uid: response.user.uid });

      // Store user authentication token, role, and display name in AsyncStorage
      await ReactNativeAsyncStorage.setItem('userToken', response.user.uid);
      await ReactNativeAsyncStorage.setItem('userRole', 'doctor');
      console.log('User Token saved!');

      console.log('userData.isDoctor:', userData.isDoctor);

      // Check if the user is a patient
      if (userData && userData.isDoctor) {
        navigation.navigate('DoctorDashboard');
        alert('User logged-in successfully');
      } else {
        alert('You are not authorized to log in as a doctor');

        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');
      }

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

        <Text style={styles.introduction}>Hello Doctor!</Text>


        <View style={styles.form}>

          <Text style={styles.label}>Username: </Text>

          <TextInput
            placeholder="Enter your Email Address"
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
          />

          <Text style={styles.label}> Password: </Text>

          <TextInput
            placeholder="Enter your Password"
            secureTextEntry
            style={styles.input}
            onChangeText={(text) => setPassword(text)}
          />

          <View style={styles.resetArea}>
            <TouchableOpacity style={styles.resetBtn} onPress={() => navigation.navigate('ResetPassword')} >
              <Text style={styles.resetText}>Forgot your Password?</Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity style={styles.btn} onPress={signIn}>
            <View style={styles.btnArea}>
              <Text style={styles.btnText}>Login</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.otherLoginArea}>
            <TouchableOpacity onPress={() => navigation.navigate('LoginPatient')}>
              <Text style={styles.otherLoginText}>Login as a Patient?</Text>
            </TouchableOpacity>
          </View>

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
  },
  img: {
    width: 250,
    height: 250,
    marginBottom: 5,
    alignSelf: 'center',
  },
  introduction: {
    fontSize: 20,
    color: '#052458',
    textAlign: 'center',
    fontFamily: 'SourceCodePro-Bold',
  },
  form: {
    paddingTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#052458',
    marginBottom: 10,
    fontFamily: 'SourceCodePro-Bold',
  },
  input: {
    borderWidth: 1.5,
    width: 300,
    borderColor: '#052458',
    padding: 10,
    borderRadius: 7,
    marginBottom: 15,
    color: '#052458',
    fontFamily: 'SourceCodePro-Medium',
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
    fontFamily: 'SourceCodePro-ExtraBold',
    opacity: 0.9,
  },
  resetText: {
    fontSize: 14,
    color: '#052458',
    marginBottom: 25,
    fontFamily: 'SourceCodePro-Italic',
    alignSelf: 'flex-end', // Align the text to the end of its container
    textAlign: 'right', // Align the text to the right within its container
  },
  resetArea: {
    alignSelf: 'flex-end', // Align the container to the end of its parent
    flexDirection: 'row', // Set the direction of the container to row
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otherLoginArea: {
    alignSelf: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  otherLoginText: {
    fontSize: 14,
    color: '#052458',
    fontFamily: 'SourceCodePro-BlackItalic',
  },
});

export default LoginDoctor;