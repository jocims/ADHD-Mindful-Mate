import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Image, Alert } from 'react-native';
import { useUserData } from './UserDataManager';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, FieldValue, getDoc, setDoc } from 'firebase/firestore'; // Import the necessary functions
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Define the ViewTasksScreen component
const WeeklyReport = () => {
    // State variables
    const navigation = useNavigation();
    const [start, setStart] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const { userData } = useUserData();
    const [taskFilter, setTaskFilter] = useState('alphabetical');
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const { updateUserData } = useUserData();
    const [taskId, setTaskId] = useState(''); // Add taskId state variable

    useEffect(() => {
        // Ensure that the updateUserData function is available
        if (updateUserData) {
            // Call the updateUserData function with the current user's UID
            updateUserData({ uid: auth.currentUser.uid });
        }
    }, []);


    // Function to get the Monday date of the current week
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const mondayDate = new Date(date.setDate(diff));

        // Format the day with leading zero if less than 10
        const formattedDay = String(mondayDate.getDate()).padStart(2, '0');
        // Format the month with leading zero if less than 10
        const formattedMonth = String(mondayDate.getMonth() + 1).padStart(2, '0');

        // Format the Monday date as DD/MM/YYYY
        const formattedMonday = `${formattedDay}/${formattedMonth}/${mondayDate.getFullYear()}`;

        return formattedMonday;
    };

    // Function to parse the deadline date string and return a Date object
    const parseDeadlineDate = (deadlineString) => {
        const [dateString, timeString] = deadlineString.split(', '); // Split the string to separate date and time
        const [day, month, year] = dateString.split('/'); // Split the date string into parts
        const [time, meridian] = timeString.split(' '); // Split the time string into parts

        let [hours, minutes] = time.split(':'); // Split hours and minutes
        hours = parseInt(hours);
        if (meridian === 'pm' && hours !== 12) {
            hours += 12; // Convert to 24-hour format if PM and not 12 PM
        } else if (meridian === 'am' && hours === 12) {
            hours = 0; // Convert 12 AM to 0 hours
        }

        // Create a Date object
        const deadlineDate = new Date(year, month - 1, day, hours, minutes);
        return deadlineDate;
    };

    const handleLogout = async () => {
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');
        navigation.navigate('FirstScreen');
    };

    // Custom sorting function to sort tasks by deadline date and then alphabetically
    const customSort = (a, b) => {
        const deadlineComparison = parseDeadlineDate(a.taskDeadline) - parseDeadlineDate(b.taskDeadline);
        if (deadlineComparison === 0) {
            // If deadline dates are equal, compare task names alphabetically
            return a.taskName.localeCompare(b.taskName);
        }
        return deadlineComparison;
    };

    // Render the component
    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleLogout} style={styles.logout}>
                    <Image source={require('../logout.png')} style={styles.logoutImg} />
                </TouchableOpacity>
                <Image source={require('../logotop.png')} style={styles.img} />
                <ScrollView showsVerticalScrollIndicator={false} style={styles.taskContainer}>
                    <View style={styles.header}>
                        <Text style={styles.introduction}>Weekly Report</Text>
                        <Text style={styles.text}>Week Commencing: {getMonday(selectedDate)}</Text>
                    </View>

                    {userData && userData.WeeklyTasks && Object.values(userData.WeeklyTasks)
                        .filter(task => task.weekCommencing === getMonday(selectedDate))
                        .sort(customSort)
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Weekly Tasks</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Name</Text>
                                    <Text style={styles.taskHeaderText}>Details</Text>
                                    <Text style={styles.taskHeaderText}>Deadline</Text>
                                    <Text style={styles.taskHeaderText}>Completed</Text>
                                    <Text style={styles.taskHeaderText}>Status</Text>
                                </View>
                                {userData && userData.WeeklyTasks && Object.values(userData.WeeklyTasks)
                                    .filter(task => task.weekCommencing === getMonday(selectedDate))
                                    .sort(customSort)
                                    .map(task => (
                                        <View key={task.id} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                            <Text style={styles.taskRowText}>{task.taskName}</Text>
                                            <Text style={styles.taskRowText}>{task.taskDescription}</Text>
                                            <Text style={styles.taskRowText}>{task.taskDeadline}</Text>
                                            <Text style={styles.taskRowText}>{task.taskDateCompleted}</Text>
                                            <Text style={styles.taskRowText}>{task.taskStatus}</Text>
                                        </View>
                                    ))}
                            </View>
                        )}

                    {userData && userData.MoodTracker && Object.values(userData.MoodTracker)
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Mood Tracker</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Time</Text>
                                    <Text style={styles.taskHeaderText}>Mood</Text>
                                </View>
                                {userData && userData.MoodTracker && Object.values(userData.MoodTracker)
                                    .map(task => (
                                        <View key={task.id} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                            <Text style={styles.taskRowText}>{task.date}</Text>
                                            <Text style={styles.taskRowText}>{task.time}</Text>
                                            <Text style={styles.taskRowText}>{task.mood}</Text>
                                        </View>
                                    ))}
                            </View>
                        )}

                    {userData && userData.GamePractice && Object.values(userData.GamePractice)
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Anxiety-Relief Game Practice</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                    <Text style={styles.taskHeaderText}>Best time</Text>
                                </View>
                                {userData && userData.GamePractice && Object.values(userData.GamePractice)
                                    .map(task => (
                                        <View key={task.id} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                            <Text style={styles.taskRowText}>{task.date}</Text>
                                            <Text style={styles.taskRowText}>{task.timeDurationOfPractice}</Text>
                                            <Text style={styles.taskRowText}>{task.gamePracticeScore}</Text>
                                        </View>
                                    ))}
                            </View>
                        )}

                    {userData && userData.Meditation && Object.values(userData.Meditation)
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Meditation Practice</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                </View>
                                {userData && userData.Meditation && Object.values(userData.Meditation)
                                    .map(task => (
                                        <View key={task.id} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                            <Text style={styles.taskRowText}>{task.date}</Text>
                                            <Text style={styles.taskRowText}>{task.timeDurationOfPractice}</Text>
                                        </View>
                                    ))}
                            </View>
                        )}

                    {userData && userData.DeepBreathing && Object.values(userData.DeepBreathing)
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Deep-Breathing Exercises</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                </View>
                                {userData && userData.DeepBreathing && Object.values(userData.DeepBreathing)
                                    .map(task => (
                                        <View key={task.id} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                            <Text style={styles.taskRowText}>{task.date}</Text>
                                            <Text style={styles.taskRowText}>{task.timeDurationOfPractice}</Text>
                                        </View>
                                    ))}
                            </View>
                        )}

                    {userData && userData.Journaling && Object.values(userData.Journaling)
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Journal Entries</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Time</Text>
                                    <Text style={styles.taskHeaderText}>Entry</Text>
                                </View>
                                {userData && userData.Journaling && Object.values(userData.Journaling)
                                    .map(task => (
                                        <View key={task.id} style={[styles.JournalingRowContainer, styles.taskRowLine]}>
                                            <Text style={styles.taskRowText}>{task.date}</Text>
                                            <Text style={styles.taskRowText}>{task.time}</Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Alert.alert(
                                                        'Journal Entry', // <-- Custom title
                                                        task.journalTextEntryText,
                                                        [
                                                            { text: 'OK', onPress: () => console.log('OK Pressed') }
                                                        ],
                                                        { cancelable: false }
                                                    );
                                                }}
                                                style={styles.viewEntryButton}
                                            >
                                                <Text style={styles.viewEntryButtonText}>View Entry</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                            </View>
                        )}
                </ScrollView>
                <View style={styles.dashboardBottomButtonContainer}>
                    <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('PatientDashboard')}>
                        <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );

};

// Styles
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch'
    },
    container: {
        flex: 1,
        padding: 5,
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
    },
    text1: {
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 5,
    },
    taskDetailsContainer: {
        marginBottom: 15,
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
        fontSize: 20,
        fontFamily: 'SourceCodePro-Bold', // Apply font family here
        marginBottom: 20,
        color: '#0C5E51', // Add color to make header text visible
        textAlign: 'center',
    },
    taskContainer: {
        marginTop: 70,
    },
    selectedTaskDetails: {
        fontFamily: 'SourceCodePro-Regular',
        fontSize: 16,
        color: '#8E225D',
    },
    dashboardBottomButtonContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20, // Add some padding if necessary
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
    taskHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    taskHeaderText: {
        flex: 1,
        fontFamily: 'SourceCodePro-Bold',
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
    },
    taskRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        alignItems: 'center',
        marginBottom: 3,
    },
    JournalingRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: 'center',
        marginBottom: 3,
    },
    taskRowText: {
        flex: 1,
        fontFamily: 'SourceCodePro-Medium',
        fontSize: 11,
        color: 'black',
        textAlign: 'center',
    },
    taskRowLine: {
        borderBottomWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: '#8E225D',
        backgroundColor: '#F0F0F0',
    },
    taskHeaderLine: {
        backgroundColor: '#8E225D',
    },
    viewEntryButton: {
        backgroundColor: '#8E225D',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 5,
        alignSelf: 'center',
    },
    viewEntryButtonText: {
        color: 'white',
        fontFamily: 'SourceCodePro-Bold',
        fontSize: 12,
        textAlign: 'center',
    },
});

export default WeeklyReport;