import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useUserData } from './UserDataManager';
import { auth, db } from '../config/firebase';

// Define the ViewTasksScreen component
const ViewTasksScreen = () => {
    // State variables
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const { userData } = useUserData();

    // useEffect to generate week dates when userData changes
    useEffect(() => {
        if (userData) {
            setWeekDates(generateWeekDates());
        }
    }, [userData]);

    // Function to get the Monday date of the current week
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

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

    // Function to handle date selection
    const handleDateSelection = (date) => {
        setSelectedDate(date);
    };

    // Return null if weekDates is empty
    if (weekDates.length === 0) {
        return null;
    }

    // Function to determine the background color and text color based on the day of the week
    const getTaskButtonStyle = (date) => {
        const day = date.getDay();
        if (day === 0 || day === 1 || day === 3 || day === 5) {
            return {
                backgroundColor: '#A3F0FD', // Light blue for Monday, Wednesday, Friday, and Sunday
                buttonColor: '#306191', // Dark blue for text color
            };
        } else {
            return {
                backgroundColor: '#c6f1c6', // Light green for Tuesday, Thursday, and Saturday
                buttonColor: '#055564', // Dark green for text color
            };
        }
    };

    // Render the component
    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Text style={styles.header}>View Tasks</Text>
                <View style={styles.dateItemsContainer}>
                    {weekDates.map(date => (
                        <TouchableOpacity key={date.toISOString()} onPress={() => handleDateSelection(date)}>
                            <View style={[styles.dateItem, selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0] ? styles.selectedDate : styles.nonSelectedDate]}>
                                <Text style={[styles.weekDay, selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0] && styles.boldDate]}>{date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</Text>
                                <Text style={[styles.weekDates, selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0] && styles.boldDate]}>{date.getDate()}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Display the selected date */}
                <Text style={styles.selectedDateText}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>

                {/* Task container */}
                <View style={styles.taskContainer}>
                    {weekDates.map(date => {
                        const tasksForDate = userData?.WeeklyTasks && Object.values(userData.WeeklyTasks).filter(task => {
                            // Log taskDeadline for debugging
                            console.log('Task deadline:', task.taskDeadline);

                            // Convert taskDeadline to YYYY-MM-DD format
                            const deadlineParts = task.taskDeadline.split('/');
                            const deadlineISO = `${deadlineParts[2]}-${deadlineParts[0].padStart(2, '0')}-${deadlineParts[1].padStart(2, '0')}`;

                            // Create Date objects
                            const deadlineDate = new Date(deadlineISO);

                            return deadlineDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
                        });

                        if (selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0]) {
                            return tasksForDate && tasksForDate.map(task => {
                                const { backgroundColor, buttonColor } = getTaskButtonStyle(date);
                                return (
                                    <TouchableOpacity key={task.taskName} onPress={() => console.log('Task clicked:', task.taskName)} style={[styles.taskButton, { backgroundColor }]}>
                                        <View style={[styles.buttonTop, { backgroundColor: buttonColor }]}></View>
                                        <Text style={[styles.tasksNames, { color: buttonColor }]}>{task.taskName}</Text>
                                    </TouchableOpacity>
                                );
                            });
                        }
                        return null;
                    })}
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
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontFamily: 'SourceCodePro-Bold', // Apply font family here
        marginBottom: 20,
        color: '#0C5E51', // Add color to make header text visible
        textAlign: 'center',
    },
    dateItemsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateItem: {
        padding: 10,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40, // Set a fixed width for the circle
        height: 36, // Set a fixed height for the circle
        borderRadius: 18, // Make it a circle
        backgroundColor: '#b0e0e6', // Light blue background color for non-selected dates
        fontFamily: 'SourceCodePro-Bold', // Apply font family here
    },
    selectedDate: {
        backgroundColor: '#DE8192', // Light blue background color for the selected date
    },
    nonSelectedDate: {
        backgroundColor: 'transparent', // Light gray background color for non-selected dates
    },
    weekDay: {
        fontFamily: 'SourceCodePro-Bold', // Apply font family here
    },
    boldDate: {
        fontFamily: 'SourceCodePro-Bold', // Apply font family here for selected date
    },
    weekDates: {
        fontFamily: 'SourceCodePro-Regular',
        textAlign: 'center',
    },
    selectedDateText: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 20,
        fontFamily: 'SourceCodePro-Bold',
        color: '#8E225D',
    },
    taskContainer: {
        marginTop: 20, // Add margin top to separate task list from dates list
        padding: 10,
    },
    taskButton: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        marginTop: 5,
        paddingStart: 15,
        position: 'relative', // Add position relative to the taskButton
    },
    buttonTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0, // Set bottom to 0 to cover the full height of the button
        width: '2%', // Set width to 2%
        borderTopLeftRadius: 5, // Maintain button border radius
        borderBottomLeftRadius: 5, // Maintain button border radius
    },
    tasksNames: {
        fontFamily: 'SourceCodePro-Bold', // Apply font family here
    },
});

// Export the component
export default ViewTasksScreen;