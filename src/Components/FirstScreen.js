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
                <View style={[styles.form, styles.text]}>


                    <Image
                        source={require('../logo3.png')}
                        style={styles.img}
                    />

                    <Text style={styles.introduction}>Hello There!</Text>

                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('LoginPatient')}>
                        <View style={styles.btnArea}>
                            <Text style={styles.btnText}>Patient</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('LoginDoctor')}>
                        <View style={styles.btnArea}>
                            <Text style={styles.btnText}>Doctor</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View >
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
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 30,

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
        width: 250,
        height: 80,
        backgroundColor: '#5D507B',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 5,
    },
    btnText: {
        fontSize: 30,
        color: 'white',
        opacity: 0.9,
        fontFamily: 'SourceCodePro-Medium',
    },
});

export default Login;