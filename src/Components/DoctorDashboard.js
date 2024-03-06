// DoctorDashboard.js

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
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

        if (storedToken === null && userData && userData.isDoctor) {
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

  // Function to handle log out
  const handleLogout = async () => {
    // Clear user token and role from AsyncStorage
    await ReactNativeAsyncStorage.removeItem('userToken');
    await ReactNativeAsyncStorage.removeItem('userRole');

    // Navigate back to the login screen
    navigation.navigate('FirstScreen');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.logout}>
        <Image source={require('../logout.png')} style={styles.logoutImg} />
      </TouchableOpacity>
      <Image source={require('../logo3.png')} style={styles.img} />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.properContent}>
        <Text style={styles.introduction}>Hello {userData ? userData.firstName + '!' : '!'}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('PatientRegistration')}>
          <Text style={styles.btnText}>Register new Patient</Text>
        </TouchableOpacity>
      </ScrollView>
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
    position: 'absolute',
    width: 250,
    height: 250,
    alignSelf: 'center',
    top: 1,
  },
  logout: {
    position: 'absolute',
    top: 15,
    right: 15, // Adjust the right position as needed
  },
  logoutImg: {
    width: 50,
    height: 50,
  },
  properContent: {
    marginTop: 250,
  },
  properContent: {
    marginTop: 255,
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