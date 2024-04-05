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
import { auth, db, signInWithEmailAndPassword } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './UserDataManager';
import ChangePassword from './ChangePassword';

const LoginPatient = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [provisionalPassword, setProvisionalPassword] = useState(false); // New state for provisional password


    const navigation = useNavigation();

    const { updateUserData } = useUserData();

    const validateInputs = () => {
        let isValid = true;

        if (!email) {
            setEmailError('Please enter your email. Eg. joe.doe@gmail.com');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError(`Please enter your password containing:
          - At least 8 characters with at least one of each of the following:
            - Uppercase letter
            - Lowercase letter
            - Number
            - Special character`);
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };


    const signIn = async () => {
        if (!validateInputs()) {
            return;
        }

        setLoading(true);
        try {
            console.log('Signing in as a patient');
            const response = await signInWithEmailAndPassword(auth, email, password);

            // Retrieve user data from Firestore based on the user's UID
            const docRef = doc(db, 'patient', response.user.uid);

            const userDoc = await getDoc(docRef);
            const userData = userDoc.data();

            // Check if the user is a patient
            if (userData && !userData.User.isDoctor) {
                console.log('User is a patient');
                console.log('userData:', userData);
                navigation.navigate('PatientDashboard');
                alert('User logged-in successfully');

                // Store user authentication token, role, and display name in AsyncStorage
                await ReactNativeAsyncStorage.setItem('userToken', response.user.uid);
                await ReactNativeAsyncStorage.setItem('userRole', 'patient');
                await ReactNativeAsyncStorage.setItem('provisionalPassword', userData.User.provisionalPassword.toString());
                console.log('User Token saved!');

                // Update user data context
                updateUserData({ uid: response.user.uid });

                console.log('userData.isDoctor:', userData.User.isDoctor);

                // Check if it's the first time login with provisional password
                if (userData.User.provisionalPassword) {
                    setProvisionalPassword(true);
                    setLoading(false);
                    return; // Stop further execution to navigate to ChangePasswordPatient
                }

                setLoading(false);
            } else {
                alert('You are not authorized to log in as a Patient.');
                console.log('User is not a patient');
                console.log('userData:', userData);

            }

        } catch (error) {

            // Display alert messages based on the error code
            if (error.code === 'auth/user-not-found') {
                alert('User not found. Please check your email.');
                console.log('error code: ' + error.code);
            } else if (error.code === 'auth/invalid-email') {
                alert('Invalid email. Please enter a valid email address.');
                console.log('error code: ' + error.code);
            } else if (error.code === 'auth/wrong-password') {
                alert('Invalid Password. Please check your password.');
                console.log('error code: ' + error.code);
            } else if (error.code === 'auth/invalid-credential') {
                alert('Invalid credentials. Please check your email and password.');
                console.log('error code: ' + error.code);
            } else {
                alert('An unexpected error occurred. Please try again later.');
                console.log('error code: ' + error.code);
            }

            setLoading(false);

        }
    };

    if (provisionalPassword) {
        return (
            <ChangePassword setProvisionalPassword={setProvisionalPassword} />
        );
    }

    return (

        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} >

                <Image
                    source={require('../logo3.png')}
                    style={styles.img}
                />


                <Text style={styles.introduction}>Hello There!</Text>


                <View style={styles.form}>

                    <Text style={styles.label}>Username: </Text>

                    <TextInput
                        placeholder="Enter your Email Address"
                        style={styles.input}
                        onChangeText={(text) => setEmail(text)}
                    />
                    {!!emailError && <Text style={styles.error}>{emailError}</Text>}

                    <Text style={styles.label}> Password: </Text>

                    <TextInput
                        placeholder="Enter your Password"
                        secureTextEntry
                        style={styles.input}
                        onChangeText={(text) => setPassword(text)}
                    />
                    {!!passwordError && <Text style={styles.error}>{passwordError}</Text>}

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
                </View>
            </ScrollView >


        </View >
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
    error: {
        color: 'red',
        fontSize: 12,
        alignSelf: 'flex-start', // Align the text to the start of its container
        marginLeft: 10, // Add some left margin to separate from the input field
    },
});

export default LoginPatient;