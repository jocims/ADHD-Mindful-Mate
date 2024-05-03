import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';


// Define the WeeklyReport component
const WeeklyReport2 = () => {
    // State variables
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date()); // Initialize selectedDate with the current week's Monday
    const [weekCommencingDates, setWeekCommencingDates] = useState([]);
    const route = useRoute();
    const { patientData } = route.params;
    const isDoctor = route.params?.isDoctor;
    const [selectedValue, setSelectedValue] = useState(selectedDate.toLocaleDateString('en-GB'));


    useEffect(() => {
        const fetchWeekCommencingDates = () => {
            const maps = Object.values(patientData);
            const dates = maps.reduce((acc, map) => {
                const mapDates = Object.values(map).map(item => item.weekCommencing);
                return [...acc, ...mapDates];
            }, []);
            // Remove duplicate dates and filter out undefined values
            const uniqueDates = [...new Set(dates)].filter(date => date !== undefined);
            setWeekCommencingDates(uniqueDates);
        };

        fetchWeekCommencingDates();
    }, [patientData]);

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

    const formattedTime = (timeInMinutes) => {
        const minutes = Math.floor(timeInMinutes);
        const seconds = Math.floor((timeInMinutes - minutes) * 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const sortByDateAndTime = (a, b) => {
        // Parse date strings to create Date objects
        const datePartsA = a.date.split('/'); // Split date string by '/'
        const dateA = new Date(`${datePartsA[2]}-${datePartsA[1]}-${datePartsA[0]} ${a.time}`); // Create Date object including time in YYYY-MM-DD HH:MM format

        const datePartsB = b.date.split('/'); // Split date string by '/'
        const dateB = new Date(`${datePartsB[2]}-${datePartsB[1]}-${datePartsB[0]} ${b.time}`); // Create Date object including time in YYYY-MM-DD HH:MM format

        // Compare dates
        if (dateA < dateB) {
            return -1;
        }
        if (dateA > dateB) {
            return 1;
        }

        // If dates are equal, compare times
        const timeA = parseInt(a.time.replace(':', ''));
        const timeB = parseInt(b.time.replace(':', ''));
        return timeA - timeB;
    };


    const sortByDateAndDuration = (a, b) => {
        // Parse date strings to create Date objects
        const datePartsA = a.date.split('/'); // Split date string by '/'
        const dateA = new Date(`${datePartsA[2]}-${datePartsA[1]}-${datePartsA[0]}`); // Create Date object in YYYY-MM-DD format

        const datePartsB = b.date.split('/'); // Split date string by '/'
        const dateB = new Date(`${datePartsB[2]}-${datePartsB[1]}-${datePartsB[0]}`); // Create Date object in YYYY-MM-DD format

        // Compare dates
        if (dateA < dateB) {
            return -1;
        }
        if (dateA > dateB) {
            return 1;
        }

        // If dates are equal, compare durations
        const durationA = parseFloat(a.timeDurationOfPractice);
        const durationB = parseFloat(b.timeDurationOfPractice);
        return durationB - durationA; // Longer duration first
    };

    const formattedMobileNo = (mobileNo) => {
        // Remove all non-numeric characters from the mobile number
        const numericMobileNo = mobileNo.replace(/\D/g, '');

        // Check if the numericMobileNo is empty or null
        if (!numericMobileNo) return '';

        // Format the mobile number as (XXX) XXX-XXXX
        const formattedMobileNo = `(${numericMobileNo.substring(0, 3)}) ${numericMobileNo.substring(3, 6)}-${numericMobileNo.substring(6, 10)}`;

        return formattedMobileNo;
    };

    const getDayOfWeek = (dateString) => {
        const [day, month, year] = dateString.split('/').map(Number);
        const date = new Date(year, month - 1, day); // Month is zero-based in JavaScript
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    const filterByWeek = (entry, startDate, endDate) => {
        const entryDateParts = entry.date.split('/'); // Split date string by '/'
        const entryDate = new Date(`${entryDateParts[2]}-${entryDateParts[1]}-${entryDateParts[0]}`); // Convert to YYYY-MM-DD format
        return entryDate >= startDate && entryDate <= endDate;
    };

    // Function to get the Monday date of the current week
    const getMondayNew = (date) => {
        const currentDate = date || new Date(); // Use the current date if no date is provided
        const dayOfWeek = currentDate.getDay();
        const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(currentDate.setDate(diff));
    };

    // Function to get the Sunday date of the current week
    const getSunday = (date) => {
        const monday = getMondayNew(date);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return sunday;
    };

    // Get the range of dates for the selected week
    const startDate = getMondayNew(selectedDate);
    const endDate = getSunday(selectedDate);

    useEffect(() => {
        console.log('Selected date before:', selectedDate);
    }, [selectedDate]);


    const handleDateChange = (itemValue) => {
        // Parse the selected date string into day, month, and year
        const [day, month, year] = itemValue.split('/').map(Number);

        // Create a new Date object using the parsed components
        let selectedDateObject = new Date(year, month - 1, day); // Month is zero-based

        // Add an hour to the selected date to account for time zone differences
        selectedDateObject = new Date(selectedDateObject.getTime() + (60 * 60 * 1000));

        // Update the selectedDate state with the new Date object
        setSelectedDate(selectedDateObject);

        // Update the selectedValue of the Picker
        setSelectedValue(itemValue);
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
                        <Text style={styles.introduction}>Weekly Report</Text>
                        {isDoctor ? (
                            <View style={styles.datePickerContainer}>
                                <Text style={styles.text}>Week Commencing: </Text>
                                <Picker
                                    selectedValue={selectedValue}
                                    style={styles.datePicker}
                                    onValueChange={(itemValue, itemIndex) => handleDateChange(itemValue)}
                                >
                                    {/* Always include the current week's Monday date */}
                                    {weekCommencingDates.includes(getMonday(selectedDate)) ? null : (
                                        <Picker.Item label={getMonday(selectedDate)} value={getMonday(selectedDate)} />
                                    )}
                                    {weekCommencingDates
                                        .sort((a, b) => {
                                            // Convert date strings to Date objects for comparison
                                            const dateA = new Date(a);
                                            const dateB = new Date(b);
                                            // Sort in descending order (latest to earliest)
                                            return dateB - dateA;
                                        })
                                        .map((date, index) => (
                                            <Picker.Item key={index} label={date} value={date} />
                                        ))}
                                </Picker>
                            </View>
                        ) : (
                            <Text style={styles.text}>Week Commencing: {getMonday(selectedDate)}</Text>
                        )}

                    </View>

                    {patientData && patientData.WeeklyTasks && Object.values(patientData.WeeklyTasks)
                        .filter(task => filterByWeek(task, startDate, endDate)) // Filter tasks by week commencing date range
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Weekly Tasks</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Name</Text>
                                        <Text style={styles.taskHeaderText}>Details</Text>
                                        <Text style={styles.taskHeaderText}>Deadline</Text>
                                        <Text style={styles.taskHeaderText}>Completed</Text>
                                        <Text style={styles.taskHeaderText}>Status</Text>
                                    </View>
                                    {Object.values(patientData.WeeklyTasks)
                                        .filter(task => filterByWeek(task, startDate, endDate)) // Filter tasks by week commencing date range
                                        .sort(customSort)
                                        .map((task, index) => (
                                            <View key={task.id || index} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                                <Text style={styles.taskRowText}>{task.taskName}</Text>
                                                <Text style={styles.taskRowText}>{task.taskDescription}</Text>
                                                <Text style={styles.taskRowText}>{task.taskDeadline}</Text>
                                                <Text style={styles.taskRowText}>{task.taskDateCompleted}</Text>
                                                <Text style={styles.taskRowText}>{task.taskStatus}</Text>
                                            </View>
                                        ))}
                                </View>
                            </>
                        )}

                    {patientData && patientData.DeepBreathing && Object.values(patientData.DeepBreathing)
                        .filter(breathing => filterByWeek(breathing, startDate, endDate)) // Filter deep breathing exercises by week commencing date range
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Deep-Breathing Exercises</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Name</Text>
                                        <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                    </View>
                                    {Object.values(patientData.DeepBreathing)
                                        .filter(breathing => filterByWeek(breathing, startDate, endDate)) // Filter deep breathing exercises by week commencing date range
                                        .sort(sortByDateAndDuration) // Sort by date and duration
                                        .map((task, index) => (
                                            <View key={task.id || index} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                                <Text style={styles.taskRowText}>{task.date}</Text>
                                                <Text style={styles.taskRowText}>{task.deepBreathingName}</Text>
                                                <Text style={styles.taskRowText}>{formattedTime(task.timeDurationOfPractice)}</Text>
                                            </View>
                                        ))}
                                </View>
                            </>
                        )}



                </ScrollView>
                <View style={styles.dashboardBottomButtonContainer}>
                    <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate(isDoctor ? 'DoctorDashboard' : 'PatientDashboard')}>
                        <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View >
        </ImageBackground >
    );
};

const getMonday = (date) => {
    // Create a new Date object with the provided date
    const currentDate = new Date(date);

    // Calculate the difference between the current day of the week and Monday
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    // Set the currentDate to the Monday of the current week
    currentDate.setDate(diff);

    // Format the Monday date
    const formattedDay = String(currentDate.getDate()).padStart(2, '0');
    const formattedMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const formattedYear = currentDate.getFullYear();

    // Format the Monday date as DD/MM/YYYY
    const formattedMonday = `${formattedDay}/${formattedMonth}/${formattedYear}`;

    return formattedMonday;
};

// Function to format date as "Mon", "Tue", etc.
const formatDate = (date) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const [day, month, year] = date.split("/");
    const formattedDate = new Date(year, month - 1, day);
    return dayNames[formattedDate.getDay()];
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
    header: {
        fontSize: 20,
        fontFamily: 'SourceCodePro-Bold', // Apply font family here
        marginBottom: 20,
        color: '#0C5E51', // Add color to make header text visible
        textAlign: 'center',
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
    text2: {
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Medium',
        marginBottom: 5,
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    datePicker: {
        width: '45%',
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
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
    },
    button: {
        backgroundColor: '#af3e76',
        width: 175,
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
        borderRadius: 5,
        alignSelf: 'center',
    },
    viewEntryButtonText: {
        color: 'white',
        fontFamily: 'SourceCodePro-Bold',
        fontSize: 12,
        textAlign: 'center',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10, // Add some top margin
        marginStart: 15,
        marginBottom: 20, // Add bottom margin to create space between the chart and screen edges
    },
    chartContainerGame1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10, // Add some top margin
        marginStart: 15,
        marginBottom: 20, // Add bottom margin to create space between the chart and screen edges
    },
    chart: {
        flex: 1,
        marginHorizontal: 5,
        marginBottom: 20, // Add bottom margin to create space between the chart and screen edges
        backgroundColor: '#FFFFFF', // Add a background color to separate the charts visually
        borderRadius: 16, // Apply border radius to match the chart style
    },
    personalDetails: {
        marginBottom: 15,
        backgroundColor: '#fff', // Adjust background color as needed
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc', // Adjust border color as needed
    },
    personalDetailsRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    labelName: {
        flex: 1,
        fontFamily: 'SourceCodePro-Bold',
        fontSize: 13,
        color: '#333', // Adjust text color as needed
    },
    labelValue: {
        flex: 2,
        marginStart: 15,
        fontFamily: 'SourceCodePro-Regular', // Adjust font family as needed
        fontSize: 13,
        color: '#555', // Adjust text color as needed
    },
});

export default WeeklyReport2;
