// PatientDashboard.js

import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Alert } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from './UserDataManager';


const PatientDashboard = () => {

  const navigation = useNavigation();
  const { userData } = useUserData();

  // Function to handle log out
  handleLogout = async () => {
    // Clear user token and role from AsyncStorage
    await ReactNativeAsyncStorage.removeItem('userToken');
    await ReactNativeAsyncStorage.removeItem('userRole');

    // Navigate back to the login screen
    this.props.navigation.navigate('Login');
  };

  return (

    <View style={styles.container}>
      <TouchableOpacity onPress={this.handleLogout} style={styles.logout}>
        <Image
          source={require('../logout.png')}
          style={styles.logoutImg}
        />
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <Image
            source={require('../logo3.png')}
            style={styles.img}
          />

          <Text>Hello {userData ? userData.firstName + '!' : '!'}</Text>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
  },
  contentContainer: {
    flex: 1,
  },
  img: {
    width: 250,
    height: 250,
    marginBottom: 20,
    alignSelf: 'center',
  },
  logout: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  logoutImg: {
    width: 50,
    height: 50,
  },
});

export default PatientDashboard;