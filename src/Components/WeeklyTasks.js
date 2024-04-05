import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const WeeklyTasks = () => {
    const [start, setStart] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [taskStatus, setTaskStatus] = useState('Created');
    const navigation = useNavigation();
    const [touchableOpacityText, setTouchableOpacityText] = useState(new Date());
    const [formattedDate, setFormattedDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [deadline, setDeadline] = useState(new Date());
    const maximumDate = getEndOfWeek();


    const getFormattedDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const handleDatePress = () => {
        setShowDatePicker(true);
    };


    const hideDatePicker = () => {
        setShowDatePicker(false);
        onChangeDeadline(touchableOpacityText);
    };

    const onChangeDeadline = (selectedDate) => {
        const formattedSelectedDate = getFormattedDate(selectedDate);
        setTouchableOpacityText(formattedSelectedDate);
        setFormattedDate(formattedSelectedDate);
        setDeadline(selectedDate);
    };


    // Function to handle set task
    const handleStart = () => {
        setStart(true);

        // Clear input fields
        setTaskName('');
        setTaskDescription('');
        setTaskStatus('Created');
    };

    // Function to handle end of journaling
    const handleEnd = async () => {
        if (taskName !== '' && taskDescription !== '' && taskStatus !== '' && deadline !== '') {
            setStart(false);
            try {

                const userDocRef = doc(db, 'patient', auth.currentUser.uid);
                const data = {
                    [Date.now().toString()]: {
                        taskName: taskName,
                        commedingDate: new Date().toISOString().split('T')[0],
                        taskDescription: taskDescription,
                        taskDeadline: deadline.toISOString().split('T')[0],
                        taskStatus: taskStatus,
                        taskDateCompleted: '',
                        weekCommencing: getMonday(new Date()).toISOString().split('T')[0],
                    },
                };

                await setDoc(userDocRef, { WeeklyTasks: data }, { merge: true });


            } catch (error) {
                console.error('Error saving deep breathing data:', error);
            }

            // Clear the journal text
            setJournalText('');
            setPrevText('');

        } else {
            alert('Please fill in all the fields');
        }

    };

    // Function to handle log out
    const handleLogout = async () => {
        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');

        // Navigate back to the login screen
        navigation.navigate('FirstScreen');
    };

    const getEndOfWeek = () => {
        const startOfWeek = getMonday();
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday is the 7th day from Monday
        return endOfWeek;
    };

    // Function to get the Monday of the current week
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    return (
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

                {start ? (
                    <>

                        <View style={styles.header}>
                            <Text style={styles.introduction}>New Task</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.fieldLabel}>Task Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Task Name"
                                value={taskName}
                                onChangeText={text => setTaskName(text)}
                            />
                            <Text style={styles.fieldLabel}>Description</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Task Description"
                                value={taskDescription}
                                onChangeText={text => setTaskDescription(text)}
                            />

                            <Text style={styles.fieldLabel}>Deadline Date</Text>
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
                                                date={deadline}
                                                onDateChange={onChangeDeadline}
                                                mode="date"
                                                minimumDate={getStartOfWeek()}
                                                maximumDate={maximumDate}
                                            />
                                            <TouchableOpacity onPress={hideDatePicker}>
                                                <Text>Done</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            <Text style={styles.fieldLabel}>Status</Text>
                            <View style={[styles.input, styles.statusInput]}>
                                <Picker
                                    selectedValue={taskStatus}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setTaskStatus(itemValue);
                                    }}
                                >
                                    <Picker.Item label="Created" value="" />
                                    <Picker.Item label="Started" value="Started" />
                                    <Picker.Item label="In Progress" value="In Progress" />
                                    <Picker.Item label="Completed" value="Completed" />
                                </Picker>
                            </View>

                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleEnd}>
                            <Text style={styles.buttonText}>Create Task</Text>
                        </TouchableOpacity>

                    </>
                ) : (
                    <>
                        <View style={styles.headerContainer}>
                            <Text style={styles.introduction}>Weekly Tasks</Text>
                            <Text style={styles.text}>Manage your tasks for the week.</Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleStart}>
                                <Text style={styles.buttonText}>Create Task</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PatientDashboard')}>
                                <Text style={styles.buttonText}>View Tasks</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('PatientDashboard')}>
                    <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
};

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
    header: {
        alignItems: 'center',
        marginBottom: 20,
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
        marginBottom: 15,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
        marginBottom: 10,
    },
    inputContainer: {
        width: '100%',
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#af3e76',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        fontFamily: 'SourceCodePro-Regular',
        color: 'black',
    },
    statusInput: {
        padding: 0,
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
        borderWidth: 1,
        borderColor: '#af3e76',
        borderRadius: 5,
        marginBottom: 20,
        fontFamily: 'SourceCodePro-Regular',
    },
    picker: {
        height: 30,
    },
    pickerItem: {
        textAlign: 'left',
        paddingLeft: 5, // Adjust padding as needed
    },
    fieldLabel: {
        fontSize: 14,
        color: 'black',
        marginBottom: 1,
        fontFamily: 'SourceCodePro-Medium',
    },
});

export default WeeklyTasks;