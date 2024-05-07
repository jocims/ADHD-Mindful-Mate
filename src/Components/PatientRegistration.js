//PatientRegistration.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ImageBackground, ScrollView, Image, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import { sendPasswordResetEmail } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const PatientRegistration = () => {
    const [warningMessages, setWarningMessages] = useState({
        patientName: '',
        patientSurname: '',
        patientEmail: '',
        patientDOB: '',
        patientGender: '',
        patientWeight: '',
        patientMobileNo: '',
        provisionalPassword: '',
        repeatPassword: '',
    });

    const [patientName, setPatientName] = useState('');
    const [patientSurname, setPatientSurname] = useState('');
    const [patientDOB, setPatientDOB] = useState(new Date());
    const [patientGender, setPatientGender] = useState('');
    const [patientWeight, setPatientWeight] = useState('');
    const [patientMobileNo, setPatientMobileNo] = useState("");
    const [patientEmail, setPatientEmail] = useState('');
    const [provisionalPassword, setProvisionalPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [doctorUid, setDoctorUid] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState(null);
    const [formattedDate, setFormattedDate] = useState('Select Date');
    const [touchableOpacityText, setTouchableOpacityText] = useState(new Date());
    const [age, setAge] = useState(0);


    const navigation = useNavigation();

    const handleDatePress = () => {
        setError(null);
        setShowDatePicker(true);
    };


    const hideDatePicker = () => {
        setShowDatePicker(false);
        onChangeDOB(touchableOpacityText);

        if (age < 18) {
            setError("You must be at least 18 years old.");
            return;
        }
    };

    const onChangeDOB = (selectedDate) => {
        console.log("Entering onChangeDOB");

        const today = new Date();
        const newAge = today.getFullYear() - selectedDate.getFullYear();

        // Handle the selected date
        console.log("Selected Date:", selectedDate);
        setAge(newAge);
        setTouchableOpacityText(selectedDate);
        setFormattedDate(selectedDate.toLocaleDateString('en-GB'));
        setPatientDOB(selectedDate);

        console.log("Exiting onChangeDOB");
    };

    useEffect(() => {
        // Check if passwords match whenever repeatPassword changes
        if (repeatPassword === provisionalPassword) {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                repeatPassword: '', // Clear the error message
            }));
        }
    }, [repeatPassword, provisionalPassword]);

    useEffect(() => {
        const getDoctorUid = async () => {
            try {
                const storedDoctorUid = await AsyncStorage.getItem('userToken');
                setDoctorUid(storedDoctorUid);
            } catch (error) {
                console.error('Error reading doctor UID from AsyncStorage:', error);
            }
        };

        getDoctorUid();
    }, []);

    // Function to validate input fields
    const validateInputs = () => {
        let isValid = true;

        const validateName = (name, fieldName) => {
            if (!/^[A-Za-z\s']{1,50}$/.test(name)) {
                setWarningMessages((prevMessages) => ({
                    ...prevMessages,
                    [fieldName]: `Invalid entry. Please enter letters only`,
                }));
                isValid = false;
            } else {
                setWarningMessages((prevMessages) => ({
                    ...prevMessages,
                    [fieldName]: '',
                }));
            }
        };

        // Validate name and surname
        validateName(patientName, 'patientName');
        validateName(patientSurname, 'patientSurname');

        // Validate date of birth
        if (age < 18) {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientDOB: 'You must be at least 18 years old.',
            }));
            isValid = false;
        } else {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientDOB: '',
            }));
        }

        // Validate Gender
        if (patientGender === '') {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientGender: 'Please select a Gender.',
            }));
            isValid = false;
        } else {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientGender: '',
            }));
        }

        // Validate weight
        if (isNaN(patientWeight) || patientWeight === '' || parseInt(patientWeight) > 500 || parseInt(patientWeight) < 40) {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientWeight: 'Please enter a valid weight above 40kg.',
            }));
            isValid = false;
        } else {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientWeight: '',
            }));
        }

        // Validate mobile number format
        const mobileNoRegex = /^(083|085|086|087|089)\d{7}$/;
        if (!mobileNoRegex.test(patientMobileNo)) {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientMobileNo: 'A valid Irish number should start with 083, 085, 086, \n087 or 089 and it should be in total lenght of 10 digits.',
            }));
            isValid = false;
        } else {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientMobileNo: '',
            }));
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(patientEmail)) {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientEmail: 'A valid email address should contain a valid domain \n(Eg. gmail.com. hotmail.com, yahoo.com, outlook.com, \nlive.com) and it should have the @ sign before it.',
            }));
            isValid = false;
        } else {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                patientEmail: '',
            }));
        }

        // Validate provisional password
        if (provisionalPassword.length < 6) {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                provisionalPassword: 'Password must be at least 6 characters long.',
            }));
            isValid = false;
        } else {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                provisionalPassword: '',
            }));
        }

        // Validate provisional password
        if (repeatPassword !== provisionalPassword) {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                repeatPassword: 'Passwords do not match.',
            }));
            isValid = false;
        } else {
            setWarningMessages((prevMessages) => ({
                ...prevMessages,
                repeatPassword: '',
            }));
        }

        return { isValid };
    };

    const handleBlur = (fieldName) => {
        switch (fieldName) {
            case 'patientName':
                if (!/^[A-Za-z\s']{1,50}$/.test(patientName)) {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: 'Invalid name. Please enter letters only',
                    }));
                } else {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: '',
                    }));
                }
                break;

            case 'patientSurname':
                if (!/^[A-Za-z\s']{1,50}$/.test(patientSurname)) {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: 'Invalid surname. Please enter letters only.',
                    }));
                } else {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: '',
                    }));
                }
                break;

            case 'patientWeight':
                if (isNaN(patientWeight) || patientWeight === '' || parseInt(patientWeight) > 500 || parseInt(patientWeight) < 40) {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: 'Please enter a valid weight above 40kg.',
                    }));
                } else {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: '',
                    }));
                }
                break;

            case 'patientMobileNo':
                const mobileRegex = /^(083|085|086|087|089)\d{7}$/;
                if (!mobileRegex.test(patientMobileNo)) {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: 'A valid Irish number should start with 083, 085, 086, \n087 or 089 and it should be in total lenght of 10 digits.',
                    }));
                } else {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: '',
                    }));
                }
                break;

            case 'patientEmail':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(patientEmail)) {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        patientEmail: 'A valid email address should contain a valid domain \n(Eg. gmail.com. hotmail.com, yahoo.com, outlook.com, \nlive.com) and it should have the @ sign before it.',
                    }));
                } else {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: '',
                    }));
                }
                break;

            case 'provisionalPassword':
                if (provisionalPassword.length < 6) {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: 'Password must be at least 6 characters long.',
                    }));
                } else {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: '',
                    }));
                }
                break;

            case 'repeatPassword':
                if (repeatPassword !== provisionalPassword) {
                    setWarningMessages((prevMessages) => ({
                        ...prevMessages,
                        [fieldName]: 'Passwords do not match.',
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

    useEffect(() => {
        // You can add any additional logic or side effects here if needed
    }, [warningMessages]); // Run the effect whenever warningMessages change


    // Utility function to format names
    const formatName = (name) => {
        return name
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };


    const handleAddPatient = async () => {
        const storedUserToken = await AsyncStorage.getItem('userToken');
        console.log('storedUserToken:', storedUserToken);

        try {
            if (!doctorUid) {
                console.error('Doctor UID is not available.');
                return;
            }

            console.log('Age:', age);
            console.log('ValidInputs:', validateInputs());

            // Check if a valid date of birth is selected
            if (age < 18) {
                setError("Please select a valid date of birth.");
                return;
            }

            // Step 1: Validate inputs
            const { isValid } = validateInputs();
            if (!isValid) {
                return;
            }

            // Confirm before adding patient
            Alert.alert(
                "Confirm",
                "Are you sure you want to add this patient?",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {
                        text: "Add",
                        onPress: async () => {

                            try {
                                // Step 1: Create a user in Firebase Authentication
                                const authUser = await createUserWithEmailAndPassword(
                                    auth,
                                    patientEmail,
                                    provisionalPassword
                                );

                                // await sendPasswordResetEmail(auth, patientEmail);

                                // Step 2: Add patient data to Firestore
                                const patientData = {
                                    User: {
                                        firstName: formatName(patientName),
                                        lastName: formatName(patientSurname),
                                        dob: patientDOB.toLocaleDateString('en-GB'),
                                        gender: patientGender,
                                        weight: patientWeight,
                                        mobileNo: patientMobileNo,
                                        email: patientEmail,
                                        isDoctor: false,
                                        doctorId: doctorUid, // Use the doctor's UID as the doctorId
                                        provisionalPassword: true,
                                    },
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
                                // Check if the error is due to email already in use
                                if (error.code === 'auth/email-already-in-use') {
                                    // Handle the error gracefully, such as displaying a message to the user
                                    alert('The email address is already in use.');
                                } else if (error.code === 'auth/weak-password') {
                                    alert('The password is too weak.');
                                } else if (error.code === 'auth/invalid-email') {
                                    alert('The email address is invalid.');
                                } else {
                                    console.error('Error adding patient: ', error);
                                }
                            }
                        }
                    }
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error adding patient: ', error);
        }
    };

    const handleLogout = async () => {
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');
        navigation.navigate('FirstScreen');
    };

    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleLogout} style={styles.logout}>
                    <Image source={require('../logout.png')} style={styles.logoutImg} />
                </TouchableOpacity>
                <Image source={require('../logotop.png')} style={styles.img} />

                <ScrollView showsVerticalScrollIndicator={false} style={styles.taskContainer}>

                    <View style={styles.header}>
                        <Text style={styles.introduction}>Register New Patient</Text>
                    </View>

                    <View style={styles.inputContainer}>

                        <Text style={styles.fieldLabel}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={patientName}
                            onChangeText={(text) => {
                                if (text.length <= 50) {
                                    setPatientName(text);
                                    setWarningMessages((prevMessages) => ({
                                        ...prevMessages,
                                        patientName: '',
                                    }));
                                } else {
                                    setWarningMessages((prevMessages) => ({
                                        ...prevMessages,
                                        patientName: 'Name cannot exceed 50 characters.',
                                    }));
                                }
                            }}
                            onBlur={() => handleBlur('patientName')}
                            maxLength={50}
                        />
                        {warningMessages.patientName && <Text style={styles.warningMessage}>{warningMessages.patientName}</Text>}
                    </View>

                    <View>
                        <Text style={styles.fieldLabel}>Surname</Text>
                        <TextInput
                            style={styles.input}
                            value={patientSurname}
                            onChangeText={(text) => {
                                if (text.length <= 50) {
                                    setPatientSurname(text);
                                    setWarningMessages((prevMessages) => ({
                                        ...prevMessages,
                                        patientSurname: '',
                                    }));
                                } else {
                                    setWarningMessages((prevMessages) => ({
                                        ...prevMessages,
                                        patientSurname: 'Surname cannot exceed 50 characters.',
                                    }));
                                }
                            }}
                            onBlur={() => handleBlur('patientSurname')}
                            maxLength={50}
                        />
                        {warningMessages.patientSurname && <Text style={styles.warningMessage}>{warningMessages.patientSurname}</Text>}

                    </View>

                    <View>
                        <Text style={styles.fieldLabel}>Date of Birth</Text>
                        <TouchableOpacity onPress={handleDatePress}>
                            <Text style={styles.input}>{formattedDate}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={showDatePicker}
                                onRequestClose={hideDatePicker}
                            >
                                <View style={styles.modalContainer}>
                                    <View style={styles.modalContent}>
                                        <DatePicker
                                            date={touchableOpacityText}
                                            onDateChange={onChangeDOB}
                                            mode="date"
                                            maximumDate={new Date()} // Set maximumDate to today's date
                                        />
                                        <TouchableOpacity onPress={hideDatePicker}>
                                            <Text>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                        )}

                        {error && <Text style={styles.warningMessage}>{error}</Text>}

                        <View >
                            <Text style={styles.fieldLabel}>Gender</Text>
                            <View style={[styles.input, styles.genderInput]}>
                                <Picker
                                    selectedValue={patientGender}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setPatientGender(itemValue);
                                        setWarningMessages((prevMessages) => ({
                                            ...prevMessages,
                                            patientGender: '', // Clear the error message
                                        }));
                                    }}
                                >
                                    <Picker.Item label="Select Gender" value="" />
                                    <Picker.Item label="Male" value="Male" />
                                    <Picker.Item label="Female" value="Female" />
                                    <Picker.Item label="Other" value="Other" />
                                </Picker>
                            </View>
                            {warningMessages.patientGender && <Text style={styles.warningMessage}>{warningMessages.patientGender}</Text>}
                        </View>

                        <View>
                            <Text style={styles.fieldLabel}>Weight</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Kg"
                                onChangeText={setPatientWeight}
                                onBlur={() => handleBlur('patientWeight')}
                            />
                            {warningMessages.patientWeight && <Text style={styles.warningMessage}>{warningMessages.patientWeight}</Text>}
                        </View>

                        <View>
                            <Text style={styles.fieldLabel}>Mobile Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Eg. 0831234567"
                                value={patientMobileNo}
                                onChangeText={setPatientMobileNo}
                                onBlur={() => handleBlur('patientMobileNo')}
                                maxLength={10} // Restrict input length to 10 characters
                            />
                            {warningMessages.patientMobileNo && <Text style={styles.warningMessage}>{warningMessages.patientMobileNo}</Text>}
                        </View>


                        <View>
                            <Text style={styles.fieldLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="joe@gmail.com"
                                value={patientEmail}
                                onChangeText={setPatientEmail}
                                onBlur={() => handleBlur('patientEmail')}
                            />
                            {warningMessages.patientEmail && <Text style={styles.warningMessage}>{warningMessages.patientEmail}</Text>}
                        </View>

                        <View>
                            <Text style={styles.fieldLabel}>Provisional Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Provisional Password"
                                value={provisionalPassword}
                                onChangeText={(text) => setProvisionalPassword(text)}
                                onBlur={() => handleBlur('provisionalPassword')}
                                secureTextEntry={true} // Hide the entered text
                            />
                            {warningMessages.provisionalPassword && <Text style={styles.warningMessage}>{warningMessages.provisionalPassword}</Text>}
                        </View>

                        <View>
                            <Text style={styles.fieldLabel}>Repeat Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Repeat Password"
                                value={repeatPassword}
                                onChangeText={(text) => setRepeatPassword(text)}
                                onBlur={() => handleBlur('repeatPassword')}
                                secureTextEntry={true} // Hide the entered text
                            />
                            {warningMessages.repeatPassword && <Text style={styles.warningMessage}>{warningMessages.repeatPassword}</Text>}
                        </View>

                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleAddPatient}>
                            <Text style={styles.buttonText}>Add Patient</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('DoctorDashboard')}>
                        <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </ScrollView >
            </View >
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
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
    taskContainer: {
        marginTop: 80,
    },
    header: {
        alignItems: 'center',
    },
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
    },
    inputContainer: {
        width: '100%',
        marginTop: 20,
    },
    form: {
        paddingTop: 20,
        paddingBottom: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fieldLabel: {
        fontSize: 14,
        color: 'black',
        marginBottom: 1,
        fontFamily: 'SourceCodePro-Medium',
    },
    input: {
        borderWidth: 2,
        width: 300,
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
        height: 50,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    warningMessage: {
        color: 'red',
        fontSize: 12,
        marginBottom: 5,
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
    pickerContainer: {
        overflow: 'hidden', // Ensure border-radius works as expected
    },
    genderInput: {
        padding: 0,
    },
    buttonContainer: {
        alignItems: 'center',
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
        alignSelf: 'center',
    },
    btnDashboardText: {
        fontSize: 15,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'SourceCodePro-Medium',
    },
});

export default PatientRegistration;