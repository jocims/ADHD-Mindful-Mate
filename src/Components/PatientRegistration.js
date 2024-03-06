//PatientRegistration.js

import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PatientRegistration = () => {
    const navigation = useNavigation();

    const [patientName, setPatientName] = useState('');
    const [patientSurname, setPatientSurname] = useState('');
    const [patientDOB, setPatientDOB] = useState('');
    const [patientGender, setPatientGender] = useState('');
    const [patientWeight, setPatientWeight] = useState('');
    const [patientMobileNo, setPatientMobileNo] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [isPatient, setIsPatient] = useState('');
    const [provisionalPassword, setProvisionalPassword] = useState('');
    const [doctorUid, setDoctorUid] = useState(null); // Add doctorUid state

    useEffect(() => {
        // Get doctor's UID from AsyncStorage
        const getDoctorUid = async () => {
            try {
                const storedDoctorUid = await AsyncStorage.getItem('userToken');
                setDoctorUid(storedDoctorUid);
            } catch (error) {
                console.error('Error reading doctor UID from AsyncStorage:', error);
            }
        };

        getDoctorUid();
    }, []); // Empty dependency array to run the effect only once

    const handleAddPatient = async () => {

        const storedUserToken = await AsyncStorage.getItem('userToken');
        console.log('storedUserToken:', storedUserToken);

        try {
            if (!doctorUid) {
                console.error('Doctor UID is not available.');
                return;
            }

            // Step 1: Create a user in Firebase Authentication
            const authUser = await createUserWithEmailAndPassword(
                auth,
                patientEmail,
                provisionalPassword
            );

            // Step 2: Add patient data to Firestore
            const patientData = {
                firstName: patientName,
                lastName: patientSurname,
                dob: patientDOB,
                gender: patientGender,
                weight: patientWeight,
                mobileNo: patientMobileNo,
                email: patientEmail,
                isPatient: true,
                doctorId: doctorUid, // Use the doctor's UID as the doctorId
            };

            const patientsCollection = collection(db, 'patient');
            await setDoc(doc(patientsCollection, authUser.user.uid), patientData);

            alert('Patient added successfully');



            // Update userToken only if it hasn't been set already
            console.log('storedUserToken after registration:', storedUserToken);

            if (storedUserToken === null || storedUserToken === undefined) {
                await AsyncStorage.setItem('userToken', doctorUid);
            }

            navigation.navigate('DoctorDashboard');
        } catch (error) {
            console.error('Error adding patient: ', error);
        }
    };

    return (

        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                    source={require('../logo3.png')}
                    style={styles.img}
                />
                <Text style={styles.title}>Register New Patient</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={patientName}
                        onChangeText={setPatientName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Surname"
                        value={patientSurname}
                        onChangeText={setPatientSurname}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Date of Birth"
                        value={patientDOB}
                        onChangeText={setPatientDOB}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Gender"
                        value={patientGender}
                        onChangeText={setPatientGender}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Weight"
                        value={patientWeight}
                        onChangeText={setPatientWeight}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mobile Number"
                        value={patientMobileNo}
                        onChangeText={setPatientMobileNo}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={patientEmail}
                        onChangeText={setPatientEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Provisional Password"
                        value={provisionalPassword}
                        onChangeText={setProvisionalPassword}
                    />
                </View>
                <TouchableOpacity style={styles.btn} onPress={handleAddPatient}>
                    <Text style={styles.btnText}>Add Patient</Text>
                </TouchableOpacity>
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
        color: 'black',
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',

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
        fontWeight: 'bold',
        opacity: 0.9,
    },
    resetText: {
        fontSize: 14,
        color: 'black',
        marginBottom: 50,
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end', // Align the text to the end of its container
        textAlign: 'right', // Align the text to the right within its container
    },
    resetArea: {
        alignSelf: 'flex-end', // Align the container to the end of its parent
        flexDirection: 'row', // Set the direction of the container to row
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default PatientRegistration;