import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView, ImageBackground, Image, TextInput, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './UserDataManager';

const windowWidth = Dimensions.get('window').width;

const WeeklyTasks = () => {
    const [start, setStart] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskStatus, setTaskStatus] = useState('Created');
    const [deadline, setDeadline] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [minimumDate, setMinimumDate] = useState(new Date());
    const [maximumDate, setMaximumDate] = useState(new Date());
    const { updateUserData } = useUserData();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [deadlinePlaceholder, setDeadlinePlaceholder] = useState('Choose Date and Time');
    const [weekDates, setWeekDates] = useState([]);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showDeadlineDatePicker, setShowDeadlineDatePicker] = useState(false);
    const [deadlineMinimumDate, setDeadlineMinimumDate] = useState(new Date()); // State for the minimum date of Deadline Date picker
    const [selectedDeadline, setSelectedDeadline] = useState(startDate);



    const handleDeadlineChange = (newDeadline) => {
        setSelectedDeadline(newDeadline);
    };


    useEffect(() => {
        setSelectedDeadline(startDate); // Initialize selectedDeadline with startDate
    }, [startDate]);

    // Inside the handleStartDateChange function:
    const handleStartDateChange = (newStartDate) => {
        setStartDate(newStartDate);
        setDeadline(newStartDate);
        setSelectedDeadline(newStartDate); // Update selectedDeadline when startDate changes
    };

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

        setMinimumDate(getMonday(new Date()));

        // Set week dates
        const dates = generateWeekDates();
        setWeekDates(dates);

        // Set maximum date to end of last date in the week list
        const lastDate = dates[dates.length - 1];
        const maxDate = new Date(lastDate);
        maxDate.setHours(23, 59, 59); // Set time to end of the day
        setMaximumDate(maxDate);

        console.log('Start Date:', startDate);
    }, []);

    const resetFields = () => {
        setTaskName('');
        setTaskDescription('');
        setTaskStatus('Created');
        setDeadline(new Date());
        setStartDate(new Date()); // Reset start date field
        setSelectedDeadline(new Date()); // Reset selected deadline field
    };

    const handleStart = () => {
        setStart(true);
        resetFields();
    };

    const confirmCreateTask = async () => {
        if (taskName !== '' && taskDescription !== '' && taskStatus !== '') {

            Alert.alert(
                'Confirmation',
                'Are you sure you want to create this task?',
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
            alert('Please fill in all the fields');
        }
    };

    const handleEnd = async () => {
        setStart(false);
        try {
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);
            const currentDate = new Date();
            const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
            const formattedDeadline = selectedDeadline.toLocaleString('en-GB', options); // Format deadline in en-GB locale
            const id = Date.now().toString();
            const data = {
                [id]: {
                    id: id,
                    taskName: taskName,
                    date: startDate.toLocaleDateString('en-GB'), // Local date and time
                    taskDescription: taskDescription,
                    taskDeadline: formattedDeadline, // Local date and time
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
        await updateUserData({ uid: auth.currentUser.uid });
        navigation.navigate('ViewTasksScreen');
    };

    const BackToDashboard = async () => {
        // Update user data context
        await updateUserData({ uid: auth.currentUser.uid });
        navigation.navigate('PatientDashboard');
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
                                        if (text.length <= 20) {
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

                                <TouchableOpacity onPress={() => setShowDeadlineDatePicker(true)}>
                                    <Text style={styles.fieldLabel}>Deadline Date</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={selectedDeadline instanceof Date ? selectedDeadline.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true }) : ''}
                                        onTouchStart={() => setShowDeadlineDatePicker(true)}
                                    />
                                </TouchableOpacity>
                                {showDeadlineDatePicker && (
                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={showDeadlineDatePicker}
                                        onRequestClose={() => setShowDeadlineDatePicker(false)}
                                    >
                                        <View style={styles.modalContainer}>
                                            <View style={styles.modalContent}>
                                                <DatePicker
                                                    date={selectedDeadline}
                                                    onDateChange={handleDeadlineChange}
                                                    mode="datetime"
                                                    minimumDate={startDate}
                                                    maximumDate={maximumDate}
                                                />
                                                <TouchableOpacity onPress={() => setShowDeadlineDatePicker(false)}>
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
                                    </Picker>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.button} onPress={confirmCreateTask}>
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

                    <TouchableOpacity style={styles.btnDashboard} onPress={BackToDashboard}>
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
        width: windowWidth * 0.75,
        height: 50.625, // Adjust the height proportionally to maintain aspect ratio
        top: 15,
        left: 1, // Adjust the right position as needed
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
    inputContainer: {
        width: '100%',
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
});

export default WeeklyTasks;