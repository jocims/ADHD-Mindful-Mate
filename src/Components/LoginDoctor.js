//Login for Doctors

// Import necessary libraries
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
  const [warningMessages, setWarningMessages] = useState({
    patientEmail: '',
    password: '',
  });

  const navigation = useNavigation();

  const { updateUserData } = useUserData();

  // Validate the email and password inputs
  const validateInputs = () => {
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;?/><.,])[\w!@#$%^&*()_+}{":;?/><.,]{8,}$/;

    if (!emailRegex.test(email)) {
      setWarningMessages((prevMessages) => ({
        ...prevMessages,
        email: `A valid email address should contain a valid domain (Eg. gmail.com. hotmail.com, yahoo.com, outlook.com, live.com) and it should have the @ sign before it.`,
      }));
      isValid = false;
    } else {
      setWarningMessages((prevMessages) => ({
        ...prevMessages,
        email: '',
      }));
    }

    if (!passwordRegex.test(password)) { // Changed from provisionalPassword
      setWarningMessages((prevMessages) => ({
        ...prevMessages,
        password: `Please enter your password containing at least 8 characters with at least one of each of the following:
- Uppercase letter
- Lowercase letter
- Number
- Special character`,
      }));
      isValid = false;
    } else {
      setWarningMessages((prevMessages) => ({
        ...prevMessages,
        password: '',
      }));
    }

    return isValid;
  };

  // Handle onBlur event for email and password inputs
  const handleBlur = (fieldName) => {
    switch (fieldName) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          setWarningMessages((prevMessages) => ({
            ...prevMessages,
            email: `A valid email address should contain a valid domain (Eg. gmail.com. hotmail.com, yahoo.com, outlook.com, live.com) and it should have the @ sign before it.`,
          }));
        } else {
          setWarningMessages((prevMessages) => ({
            ...prevMessages,
            [fieldName]: '',
          }));
        }
        break;

      case 'password':
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;?/><.,])[\w!@#$%^&*()_+}{":;?/><.,]{8,}$/;
        if (!passwordRegex.test(password)) {
          setWarningMessages((prevMessages) => ({
            ...prevMessages,
            [fieldName]: `Please enter your password containing at least 8 characters with at least one of each of the following:
- Uppercase letter
- Lowercase letter
- Number
- Special character`,
          }));
        } else {
          setWarningMessages((prevMessages) => ({
            ...prevMessages,
            [fieldName]: '',
          }));
        }
        break;

      default:
        break;
    }
  };

  const signIn = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      console.log('Signing in as a doctor');
      const response = await signInWithEmailAndPassword(auth, email, password);

      // Retrieve user data from Firestore based on the user's UID
      const docRef = doc(db, 'doctor', response.user.uid);

      const userDoc = await getDoc(docRef);
      const userData = userDoc.data();

      // Check if the user is a doctor
      if (userData && userData.User.isDoctor) {
        navigation.navigate('DoctorDashboard');
        alert('User logged-in successfully');

        // Store user authentication token, role, and display name in AsyncStorage
        await ReactNativeAsyncStorage.setItem('userToken', response.user.uid);
        await ReactNativeAsyncStorage.setItem('userRole', 'doctor');
        console.log('User Token saved!');

        // Update user data context
        updateUserData({ uid: response.user.uid });

        console.log('userData.isDoctor:', userData.User.isDoctor);

        setLoading(false);

      } else {
        alert('You are not authorized to log in as a Doctor.');

      }

    } catch (error) {
      // console.error('Error signing in:', error);

      // Display alert messages based on the error code
      if (error.code === 'auth/user-not-found') {
        alert('User not found. Please check your email.');
        console.log('error code: ' + error.code);
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email. Please enter a valid email address.');
        console.log('error code: ' + error.code);
      } else if (error.code === 'auth/wrong-password') {
        alert('Invalid Password. It should be a minimum of 8 in length, containing a mix of upper and lower case letters, special characters and digits. ');
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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={require('../logo3.png')} style={styles.img} />
        <Text style={styles.introduction}>Hello Doctor!</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Username: </Text>
          <TextInput
            placeholder="Enter your Email Address"
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
            onBlur={() => handleBlur('email')}
          />
          {warningMessages.email && <Text style={styles.error}>{warningMessages.email}</Text>}

          <Text style={styles.label}> Password: </Text>
          <TextInput
            placeholder="Enter your Password"
            secureTextEntry
            style={styles.input}
            onChangeText={(text) => setPassword(text)}
            onBlur={() => handleBlur('password')}
          />
          {warningMessages.password && <Text style={styles.error}>{warningMessages.password}</Text>}

          <View style={styles.resetArea}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => navigation.navigate('ResetPassword')}
            >
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
    width: 300,
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    padding: 2,
    fontFamily: 'SourceCodePro-Medium',
  },
});

export default LoginDoctor;