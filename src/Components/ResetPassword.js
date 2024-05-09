// ResetPassword.js

//Imports
import React, { useState } from 'react';
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
import { auth, sendPasswordResetEmail } from '../config/firebase'; // Adjust the import

// ResetPassword component
const ResetPassword = () => {

    // Variables
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    // Validate the email and password inputs
    const validateInputs = () => {
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setEmailError('A valid email address should contain a valid email domain (gmail.com, hotmail.com, yahoo.com, outlook.com, live.com) and it should have the `@` sign before it.');
            isValid = false;
        } else {
            setEmailError('');
        }

        return isValid;
    };


    // Reset password function
    const resetPassword = async () => {
        if (!validateInputs()) {
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent successfully');
            setLoading(false);
            navigation.navigate('FirstScreen');
        } catch (error) {
            setLoading(false);

            if (error.code === 'auth/user-not-found') {
                alert('User not found');
            } else if (error.code === 'auth/invalid-email') {
                alert('Invalid email');
            } else {
                alert('An error occurred. Please try again');
            }
        }
    };

    // Return
    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                    source={require('../logo3.png')}
                    style={styles.img}
                />
                <Text style={styles.introduction}>Reset Password</Text>

                <View style={styles.form}>

                    <Text style={styles.label}>Email: </Text>

                    <TextInput
                        placeholder="joe.doe@gmail.com"
                        style={styles.input}
                        onChangeText={(text) => setEmail(text)}
                    />
                    {!!emailError && <Text style={styles.error}>{emailError}</Text>}

                    <TouchableOpacity style={styles.btn} onPress={resetPassword}>
                        <Text style={styles.btnText}>Reset Password</Text>
                    </TouchableOpacity>

                    <View style={styles.resetArea}>
                        <TouchableOpacity style={styles.resetBtn} onPress={() => navigation.navigate('FirstScreen')}>
                            <Text style={styles.resetText}>Back to Home Screen</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </ScrollView>
        </View>
    );
}

// Styles
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
        color: '#052458',
        textAlign: 'center',
        fontFamily: 'SourceCodePro-Bold',
    },
    form: {
        paddingTop: 20,
        paddingBottom: 20,
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
        marginBottom: 20,
        color: '#052458',
        fontFamily: 'SourceCodePro-Medium',
    },
    btn: {
        width: 200,
        height: 50,
        backgroundColor: '#052458',
        borderRadius: 7,
        justifyContent: 'center',
    },
    btnText: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'SourceCodePro-Bold',
        opacity: 0.9,
        textAlign: 'center',
    },
    resetText: {
        fontSize: 14,
        color: '#052458',
        marginTop: 40,
        fontFamily: 'SourceCodePro-Italic',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    resetArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    error: {
        width: 300,
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
        padding: 2,
        fontFamily: 'SourceCodePro-Medium',
        textAlign: 'left', // Align the error message to the left
    },
});

export default ResetPassword;