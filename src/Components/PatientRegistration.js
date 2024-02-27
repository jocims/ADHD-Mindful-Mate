import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { auth, db, signInWithEmailAndPassword } from '../config/firebase'; // Adjust the import
import { doc, getDoc } from 'firebase/firestore';
import { useUserData } from './UserDataManager';

const PatientRegistration = () => {

    const navigation = useNavigation();
    const { userData } = useUserData();

    const [patientName, setPatientName] = React.useState('');
    const [patientSurname, setpatientSurname] = React.useState('');
    const [patientDOB, setpatientDOB] = React.useState('');
    const [patientGender, setpatientGender] = React.useState('');
    const [patientWeight, setpatientWeight] = React.useState('');
    const [patientMobileNo, setpatientMobileNo] = React.useState('');
    const [patientEmail, setpatientEmail] = React.useState('');
    const [provisionalPassword, setprovisionalPassword] = React.useState('');

    const handleAddPatient = async () => {
        try {
            const patientData = {
                name: patientName,
                surname: patientSurname,
                dob: patientDOB,
                gender: patientGender,
                weight: patientWeight,
                mobileNo: patientMobileNo,
                email: patientEmail,
                provisionalPassword: provisionalPassword,
                doctorId: userData.uid
            };

            const patientRef = doc(db, 'patients', patientData.email);
            await setDoc(patientRef, patientData);
            alert('Patient added successfully');
            navigation.navigate('DoctorDashboard');
        }
        catch (error) {
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
                        onChangeText={setpatientSurname}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Date of Birth"
                        value={patientDOB}
                        onChangeText={setpatientDOB}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Gender"
                        value={patientGender}
                        onChangeText={setpatientGender}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Weight"
                        value={patientWeight}
                        onChangeText={setpatientWeight}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mobile Number"
                        value={patientMobileNo}
                        onChangeText={setpatientMobileNo}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={patientEmail}
                        onChangeText={setpatientEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Provisional Password"
                        value={provisionalPassword}
                        onChangeText={setprovisionalPassword}
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