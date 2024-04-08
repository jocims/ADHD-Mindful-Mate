import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useUserData } from './UserDataManager';
import { auth, db } from '../config/firebase';

const ViewTasksScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const { userData } = useUserData();

    useEffect(() => {
        // Generate week dates when userData is available
        if (userData) {
            setWeekDates(generateWeekDates());
        }
    }, [userData]);

    useEffect(() => {
        // console.log('User Data Changed:', userData);

        // Check if the storedUserToken is updated before logging
        if (auth.currentUser.uid !== null) {
            console.log('auth.currentUser.uid in ViewTasksScreen:', auth.currentUser.uid);
        }
    }, [userData, auth.currentUser.uid]);


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

    // Render item for each date in the calendar view
    const renderDateItem = (item) => {
        const key = item.toISOString(); // Using the date object as a unique key
        // Fetch tasks for the selected date
        const tasksForDate = userData?.WeeklyTasks && Object.values(userData.WeeklyTasks).filter(task => {
            const deadlineDate = new Date(task.taskDeadline);
            return deadlineDate.toISOString().split('T')[0] === item.toISOString().split('T')[0];
        });
        return (
            <TouchableOpacity key={key} onPress={() => handleDateSelection(item)}>
                <View style={[styles.dateItem, selectedDate.toISOString().split('T')[0] === item.toISOString().split('T')[0] ? styles.selectedDate : styles.nonSelectedDate]}>
                    <Text style={styles.weekDay}>{item.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</Text>
                    <Text style={{ textAlign: 'center' }}>{item.getDate()}</Text>
                </View>
                {/* Render tasks for the selected date */}
                {selectedDate.toISOString().split('T')[0] === item.toISOString().split('T')[0] && (
                    <View style={styles.taskContainer}>
                        {tasksForDate && tasksForDate.map(task => (
                            <Text key={task.taskName}>{task.taskName}</Text>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Return null if weekDates is empty
    if (weekDates.length === 0) {
        return null;
    }

    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Text style={styles.header}>View Tasks</Text>
                <View style={styles.dateItemsContainer}>
                    {weekDates.map(date => renderDateItem(date))}
                </View>
            </View>
        </ImageBackground>
    );
};

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
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white', // Add color to make header text visible
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
        width: 36, // Set a fixed width for the circle
        height: 36, // Set a fixed height for the circle
        borderRadius: 18, // Make it a circle
        backgroundColor: '#b0e0e6', // Light blue background color for non-selected dates
    },
    selectedDate: {
        backgroundColor: '#b0e0e6', // Light blue background color for the selected date
    },
    nonSelectedDate: {
        backgroundColor: 'transparent', // Light gray background color for non-selected dates
    },
    weekDay: {
        fontWeight: 'bold',
    },
    taskContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0', // Light gray background color for tasks
    },
});

export default ViewTasksScreen;