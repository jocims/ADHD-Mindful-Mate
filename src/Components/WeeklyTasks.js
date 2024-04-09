import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './UserDataManager';

const WeeklyTasks = () => {
    const [start, setStart] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskStatus, setTaskStatus] = useState('Created');
    const [deadline, setDeadline] = useState(new Date());
    const [minimumDate, setMinimumDate] = useState(new Date());
    const [maximumDate, setMaximumDate] = useState(new Date());
    const { updateUserData } = useUserData();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [deadlinePlaceholder, setDeadlinePlaceholder] = useState('Choose Date and Time');
    const [weekDates, setWeekDates] = useState([]);


    useEffect(() => {
        // Function to generate dates for the current week (Monday to Sunday)
        const generateWeekDates = () => {
            const currentDate = new Date();
            const monday = getMonday(currentDate);
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                dates.push(date);
            }
            return dates;
        };

        // Set minimum date to Monday of current week
        const monday = getMonday(new Date());
        setMinimumDate(monday);

        // Set week dates
        const dates = generateWeekDates();
        setWeekDates(dates);

        // Set maximum date to end of last date in the week list
        const lastDate = dates[dates.length - 1];
        const maxDate = new Date(lastDate);
        maxDate.setHours(23, 59, 59); // Set time to end of the day
        setMaximumDate(maxDate);
    }, []);

    const resetFields = () => {
        setTaskName('');
        setTaskDescription('');
        setTaskStatus('Created');
        setDeadline(new Date());
    };

    const handleStart = () => {
        setStart(true);
        resetFields();
    };

    const handleEnd = async () => {
        if (taskName !== '' && taskDescription !== '' && taskStatus !== '') {
            setStart(false);
            try {
                const userDocRef = doc(db, 'patient', auth.currentUser.uid);
                const currentDate = new Date();
                const data = {
                    [Date.now().toString()]: {
                        taskName: taskName,
                        commedingDate: currentDate.toLocaleDateString('en-GB'), // Local date and time
                        taskDescription: taskDescription,
                        taskDeadline: deadline.toLocaleString(), // Local date and time
                        taskStatus: taskStatus,
                        taskDateCompleted: '',
                        weekCommencing: getMonday(deadline).toLocaleDateString('en-GB'), // Local date and time
                    },
                };

                await setDoc(userDocRef, { WeeklyTasks: data }, { merge: true });

                alert('Task created successfully.');
            } catch (error) {
                console.error('Error saving task data:', error);
            }
        } else {
            alert('Please fill in all the fields');
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

    const ViewTasks = async () => {
        // Update user data context
        updateUserData({ uid: auth.currentUser.uid });
        navigation.navigate('ViewTasksScreen');
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
                                    onChangeText={text => {
                                        // Limit the input to 20 characters
                                        if (text.length <= 15) {
                                            setTaskName(text);
                                        }
                                    }}
                                />
                                <Text style={styles.fieldLabel}>Description</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Task Description"
                                    value={taskDescription}
                                    onChangeText={text => {
                                        // Limit the input to 50 characters
                                        if (text.length <= 50) {
                                            setTaskDescription(text);
                                        }
                                    }}
                                />
                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                    <Text style={styles.fieldLabel}>Deadline Date</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={deadline instanceof Date ? deadline.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true }) : ''}
                                        onTouchStart={() => setShowDatePicker(true)}
                                    />
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={showDatePicker}
                                        onRequestClose={() => setShowDatePicker(false)}
                                    >
                                        <View style={styles.modalContainer}>
                                            <View style={styles.modalContent}>
                                                <DatePicker
                                                    date={deadline}
                                                    onDateChange={setDeadline}
                                                    mode="datetime"
                                                    minimumDate={minimumDate}
                                                    maximumDate={maximumDate}
                                                />
                                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
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
                                        <Picker.Item label="Created" value="Created" />
                                        <Picker.Item label="Started" value="Started" />
                                        <Picker.Item label="In Progress" value="In Progress" />
                                        <Picker.Item label="Completed" value="Completed" />
                                    </Picker>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.button} onPress={handleEnd}>
                                <Text style={styles.buttonText}>Create Task</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, styles.clearBtn]} onPress={resetFields}>
                                <Text style={styles.buttonText}>Clear Fields</Text>
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
                                <TouchableOpacity style={styles.button} onPress={ViewTasks}>
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
    fieldLabel: {
        fontSize: 14,
        color: 'black',
        marginBottom: 1,
        fontFamily: 'SourceCodePro-Medium',
    },
});

export default WeeklyTasks;