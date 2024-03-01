// DoctorDashboard.js

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from './UserDataManager';

const DoctorDashboard = () => {
  const navigation = useNavigation();
  const { userData } = useUserData();
  const [storedUserToken, setStoredUserToken] = useState(null);

  useEffect(() => {
    const checkUserToken = async () => {
      try {
        const storedToken = await ReactNativeAsyncStorage.getItem('userToken');
        setStoredUserToken(storedToken);

        if (storedToken === null && userData && userData.role === 'doctor') {
          await ReactNativeAsyncStorage.setItem('userToken', userData.uid);
          setStoredUserToken(userData.uid);
        }
      } catch (error) {
        console.error('Error checking or setting user token:', error);
      }
    };

    checkUserToken();
  }, [userData]);

  useEffect(() => {
    console.log('User Data Changed:', userData);

    // Check if the storedUserToken is updated before logging
    if (storedUserToken !== null) {
      console.log('Stored User Token in DoctorDashboard:', storedUserToken);
    }
  }, [userData, storedUserToken]);



  const patients = [
    { id: 1, name: 'Patient 1' },
    { id: 2, name: 'Patient 2' },
    { id: 3, name: 'Patient 3' },
    { id: 4, name: 'Patient 4' },
    { id: 5, name: 'Patient 5' },
    { id: 6, name: 'Patient 6' },
    { id: 7, name: 'Patient 7' },
    { id: 8, name: 'Patient 8' },
    { id: 9, name: 'Patient 9' },
  ];

  const renderPatient = ({ item, index }) => (
    <TouchableOpacity style={[styles.list, index === patients.length - 1 && patients.length % 2 !== 0 ? { width: 305 } : null]}>
      <Text style={styles.btnText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Function to handle log out
  handleLogout = async () => {
    // Clear user token and role from AsyncStorage
    await ReactNativeAsyncStorage.removeItem('userToken');
    await ReactNativeAsyncStorage.removeItem('userRole');

    // Navigate back to the login screen
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>


      <FlatList showsVerticalScrollIndicator={false}
        data={patients}
        numColumns={2}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <>
            <TouchableOpacity onPress={handleLogout} style={styles.logout}>
              <Image source={require('../logout.png')} style={styles.logoutImg} />
            </TouchableOpacity>
            <Image source={require('../logo3.png')} style={styles.img} />
            <Text style={styles.introduction}>Hello {userData ? userData.firstName + '!' : '!'}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PatientRegistration')}>
              <Text style={styles.btnText}>Register new Patient</Text>
            </TouchableOpacity>
          </>
        )}
      />
    </View>
  );
};
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
    marginBottom: 10,
    alignSelf: 'center',
    marginTop: -50,
  },
  logout: {
    position: 'relative',
    top: 15,
    right: -260,
  },
  logoutImg: {
    width: 50,
    height: 50,
  },
  btn: {
    backgroundColor: '#AF3E76',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: 305,
    height: 80,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'SourceCodePro-Medium',
  },
  list: {
    backgroundColor: '#5F6EB5',
    padding: 10,
    borderRadius: 5,
    width: 150,
    height: 80,
    margin: 2,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introduction: {
    fontSize: 25,
    textAlign: 'center',
    color: '#0C5E51',
    fontFamily: 'SourceCodePro-Bold',
  },
  i2: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#8E225D',
    fontFamily: 'SourceCodePro-BlackItalic',
  },
  i3: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#0175FF',
    fontFamily: 'SourceCodePro-Bold',
  },
  i4: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#0C5E51',
    fontFamily: 'SourceCodePro-BoldItalic',
  },
  i5: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#5D507B',
    fontFamily: 'SourceCodePro-ExtraBold',
  },
  i6: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#5F6EB5',
    fontFamily: 'SourceCodePro-ExtraBoldItalic',
  },
  i7: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#D64F5D',
    fontFamily: 'SourceCodePro-ExtraLight',
  },
  i8: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#BA696B',
    fontFamily: 'SourceCodePro-ExtraLightItalic',
  },
  i9: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#053B90',
    fontFamily: 'SourceCodePro-Italic',
  },
  i10: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
    fontFamily: 'SourceCodePro-Light',
  },
  i11: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
    fontFamily: 'SourceCodePro-Medium',
  },
  i12: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
    fontFamily: 'SourceCodePro-MediumItalic',
  },
  i13: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
    fontFamily: 'SourceCodePro-Regular',
  },
  i14: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#D64F5D',
    fontFamily: 'SourceCodePro-SemiBold',
  },
  i15: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#BA696B',
    fontFamily: 'SourceCodePro-SemiBoldItalic',
  },
  i16: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#053B90',
    fontFamily: 'SourceCodePro-Bold',
  },
});

export default DoctorDashboard;