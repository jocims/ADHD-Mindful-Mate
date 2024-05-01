import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image, TextInput, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const Notes = () => {
    const [start, setStart] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [medication1, setMedication1] = useState('');
    const [medication2, setMedication2] = useState('');
    const [medication3, setMedication3] = useState('');
    const [dosage1, setDosage1] = useState('');
    const [dosage2, setDosage2] = useState('');
    const [dosage3, setDosage3] = useState('');
    const [pattern, setPattern] = useState('');
    const [treatmentNotes, settreatmentNotes] = useState('');

    const navigation = useNavigation();
    const route = useRoute();
    const patientToken = route.params?.patientToken;
    const isDoctor = route.params?.isDoctor;

    const confirmCreateTask = async () => {
        // Check if any medication is entered without dosage
        if ((medication1 !== '' && dosage1 === '') ||
            (medication2 !== '' && dosage2 === '') ||
            (medication3 !== '' && dosage3 === '')) {
            Alert.alert(
                'Missing Dosage',
                'Please enter dosage for all prescribed medications.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
            );
            return;
        }

        // Check if any dosage is entered without medication
        if ((dosage1 !== '' && medication1 === '') ||
            (dosage2 !== '' && medication2 === '') ||
            (dosage3 !== '' && medication3 === '')) {
            Alert.alert(
                'Missing Medication',
                'Please enter medication for all prescribed dosages.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
            );
            return;
        }

        // Proceed with creating the note
        if (diagnosis !== '' || medication1 !== '' || dosage1 !== '' || medication2 !== '' || dosage2 !== '' || medication3 !== '' || dosage3 !== '' || pattern !== '' || treatmentNotes !== '') {
            Alert.alert(
                'Confirmation',
                'Are you sure you want to create this note?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Yes', onPress: () => handleEnd() },
                ],
                { cancelable: false }
            );
        } else {
            alert('Please fill in the desired fields');
        }
    };

    const handleEnd = async () => {
        setStart(false);
        try {

            const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
            const [hours, minutes] = currentTime.split(':');
            const timeWithoutSeconds = `${hours}:${minutes}`;


            const userDocRef = doc(db, 'patient', patientToken);
            const currentDate = new Date();
            const id = Date.now().toString();
            const data = {
                [id]: {
                    id: id,
                    patientDiagnosis: diagnosis,
                    medication1: medication1,
                    dosage1: dosage1,
                    medication2: medication2,
                    dosage2: dosage2,
                    medication3: medication3,
                    dosage3: dosage3,
                    identifiedPattern: pattern,
                    treatmentNotes: treatmentNotes,
                    time: timeWithoutSeconds,
                    date: currentDate.toLocaleDateString('en-GB'), // Local date and time
                    weekCommencing: getMonday(new Date()).toLocaleDateString('en-GB'),
                },
            };

            await setDoc(userDocRef, { Notes: data }, { merge: true });

            alert('Note created successfully.');

            navigation.navigate('DoctorDashboard');

        } catch (error) {
            console.error('Error saving task data:', error);
        }

    };

    const handleLogout = async () => {
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');
        navigation.navigate('FirstScreen');
    };

    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollView}>
            <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
                <View style={styles.container}>
                    {start ? null : (
                        <>
                            <TouchableOpacity onPress={handleLogout} style={styles.logout}>
                                <Image source={require('../logout.png')} style={styles.logoutImg} />
                            </TouchableOpacity>
                            <Image source={require('../logotop.png')} style={styles.img} />
                        </>
                    )}
                    <View style={styles.header}>
                        <Text style={styles.introduction}>Notes</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.fieldLabel}>Diagnosis</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Diagnosis"
                            value={diagnosis}
                            onChangeText={text => {
                                // Limit the input to 20 characters
                                if (text.length <= 100) {
                                    setDiagnosis(text);
                                }
                            }}
                        />
                        <Text style={styles.fieldLabel}>Prescribed Medication #1</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Prescribed Medication #1"
                            value={medication1}
                            onChangeText={text => {
                                // Limit the input to 50 characters
                                if (text.length <= 100) {
                                    setMedication1(text);
                                }
                            }}
                        />
                        <Text style={styles.fieldLabel}>Medication dosage #1</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Medication dosage #1"
                            value={dosage1}
                            onChangeText={text => {
                                // Limit the input to 50 characters
                                if (text.length <= 50) {
                                    setDosage1(text);
                                }
                            }}
                        />
                        <Text style={styles.fieldLabel}>Prescribed Medication #2</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Prescribed Medication #2"
                            value={medication2}
                            onChangeText={text => {
                                // Limit the input to 50 characters
                                if (text.length <= 100) {
                                    setMedication2(text);
                                }
                            }}
                        />
                        <Text style={styles.fieldLabel}>Medication dosage #2</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Medication dosage #2"
                            value={dosage2}
                            onChangeText={text => {
                                // Limit the input to 50 characters
                                if (text.length <= 50) {
                                    setDosage2(text);
                                }
                            }}
                        />
                        <Text style={styles.fieldLabel}>Prescribed Medication #3</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Prescribed Medication #3"
                            value={medication3}
                            onChangeText={text => {
                                // Limit the input to 50 characters
                                if (text.length <= 100) {
                                    setMedication3(text);
                                }
                            }}
                        />
                        <Text style={styles.fieldLabel}>Medication dosage #3</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Medication dosage #3"
                            value={dosage3}
                            onChangeText={text => {
                                // Limit the input to 50 characters
                                if (text.length <= 50) {
                                    setDosage3(text);
                                }
                            }}
                        />
                        <Text style={styles.fieldLabel}>Identified Pattern</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Identified Pattern"
                            value={pattern}
                            onChangeText={text => {
                                // Limit the input to 100 characters
                                if (text.length <= 100) {
                                    setPattern(text);
                                }
                            }}
                        />
                        <Text style={styles.fieldLabel}>Treatment Notes</Text>
                        <TextInput
                            style={styles.input}
                            multiline={true}
                            placeholder="Write your notes here..."
                            value={treatmentNotes}
                            onChangeText={text => {
                                // Limit the number of characters
                                if (text.length <= 500) {
                                    // Limit the number of lines
                                    const lines = text.split('\n');
                                    if (lines.length <= 20) {
                                        settreatmentNotes(text);
                                    }
                                }
                            }}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={confirmCreateTask}>
                        <Text style={styles.buttonText}>Create Note</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate("DoctorDashboard")}>
                        <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 20,
    },
    img: {
        position: 'absolute',
        width: 337.5,
        height: 67.5,
        top: 10,
        left: 1,
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
    header: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 65,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: '45%',
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
        flex: 1,
        justifyContent: 'center', // Center vertically
    },
    button: {
        backgroundColor: '#af3e76',
        width: '60%',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 20,
    },
    clearBtn: {
        backgroundColor: '#8E225D',
        elevation: 5,

    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'SourceCodePro-Medium',
    },
    btnDashboard: {
        backgroundColor: '#052458',
        padding: 10,
        borderRadius: 5,
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDashboardText: {
        fontSize: 15,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'SourceCodePro-Medium',
    },
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
        marginBottom: 10,
    },
    input: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        fontFamily: 'SourceCodePro-Regular',
        color: '#333',
        backgroundColor: '#fff',
        shadowColor: '#af3e76',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statusInput: {
        padding: 0,
        fontFamily: 'SourceCodePro-Regular',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        width: '100%',
    },
    fieldLabel: {
        fontSize: 14,
        color: 'black',
        marginBottom: 1,
        fontFamily: 'SourceCodePro-Medium',
        marginStart: 5,
    },
    inputContainer: {
        flex: 1,
        width: '100%',
    },
});

export default Notes;