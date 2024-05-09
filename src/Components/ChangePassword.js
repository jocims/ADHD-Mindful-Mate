// ChangePassword.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, TouchableOpacity, Alert, Image } from 'react-native';
import { getAuth, updatePassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;

const ChangePassword = ({ setProvisionalPassword }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigation = useNavigation();

    const handleChangePassword = async () => {
        setLoading(true);

        try {

            if (!isPasswordValid(newPassword)) {
                setErrorMessage('A strong password should be a minimum of 8 characters in length, containing a mix of upper and lower case letters, special characters, and digits.');
                setLoading(false);
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorMessage('Passwords do not match');
                setLoading(false);
                return;
            }

            const auth = getAuth();
            const user = auth.currentUser;

            await updatePassword(user, newPassword);

            Alert.alert('Success', 'Password changed successfully.');

            await ReactNativeAsyncStorage.setItem('provisionalPassword', 'false');

            const userDatas = doc(db, 'patient', auth.currentUser.uid);
            await updateDoc(userDatas, {
                'User.provisionalPassword': false
            });

            setProvisionalPassword(false);

            navigation.navigate('PatientDashboard');

        } catch (error) {
            console.log(error);
            setErrorMessage('Failed to change password. Please try again later.');
        }
        setLoading(false);
    };

    const isPasswordValid = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;?/><.,])[\w!@#$%^&*()_+}{":;?/><.,]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleLogout = async () => {
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');

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
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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
        right: 15,
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
    errorText: {
        width: 300,
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
        fontFamily: 'SourceCodePro-Medium',
    },
});

export default ChangePassword;
