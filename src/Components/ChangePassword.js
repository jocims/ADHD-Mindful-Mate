// ChangePassword.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { getAuth, updatePassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const ChangePassword = ({ setProvisionalPassword }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const handleChangePassword = async () => {
        setLoading(true);

        try {

            const userToken = await ReactNativeAsyncStorage.getItem('userToken');

            // Validate new password
            if (!isPasswordValid(newPassword)) {
                Alert.alert(
                    'Invalid Password',
                    'Password must have at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.'
                );
                setLoading(false);
                return;
            }

            if (newPassword !== confirmPassword) {
                Alert.alert('Passwords do not match');
                setLoading(false);
                return;
            }

            const auth = getAuth();
            const user = auth.currentUser;

            // Change password
            await updatePassword(user, newPassword);

            // Password changed successfully
            Alert.alert('Success', 'Password changed successfully.');

            // const patientsCollection = collection(db, 'patient');
            // await setDoc(doc(patientsCollection, userData.uid), patientData);

            // Set provisionalPassword to false in Firestore
            const userDatas = doc(db, 'patient', userToken); // Ensure userData is defined
            console.log('userDatas **************************:', userDatas);
            await updateDoc(userDatas, {
                'User.provisionalPassword': false // Path to the provisionalPassword field
            });

            // Update local state to reflect the change
            setProvisionalPassword(false);

            navigation.navigate('PatientDashboard');


        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to change password. Please try again later.');
        }
        setLoading(false);
    };

    // Password validation function
    const isPasswordValid = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;?/><.,])[\w!@#$%^&*()_+}{":;?/><.,]{8,}$/;
        return passwordRegex.test(password);
    };

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
            <Image source={require('../logo3.png')} style={styles.logo} />
            <Text style={styles.label}>Enter New Password:</Text>
            <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <Text style={styles.label}>Confirm New Password:</Text>
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Changing Password...' : 'Change Password'}</Text>
            </TouchableOpacity>
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
    logout: {
        position: 'absolute',
        top: 15,
        right: 15, // Adjust the right position as needed
    },
    logoutImg: {
        width: 50,
        height: 50,
    },
    logo: {
        width: 250,
        height: 250,
        marginBottom: 20,
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
    button: {
        width: 215,
        height: 50,
        backgroundColor: '#052458',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'SourceCodePro-ExtraBold',
        opacity: 0.9,
    },
});

export default ChangePassword;