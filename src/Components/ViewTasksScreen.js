import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUserData } from './UserDataManager';

const ViewTasksScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const { userData } = useUserData(); // Get user data from UserDataManager

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

    useEffect(() => {
        // Generate week dates when userData is available
        if (userData) {
            setWeekDates(generateWeekDates());
        }
    }, [userData]);

    // Function to handle date selection
    const handleDateSelection = (date) => {
        setSelectedDate(date);
    };

    // Render item for each date in the calendar view
    const renderDateItem = (item) => {
        const key = item.toISOString(); // Using the date object as a unique key
        // Fetch tasks for the selected date
        const tasksForDate = userData?.WeeklyTasks && Object.values(userData.WeeklyTasks).filter(task => task.taskDeadline === item.toISOString().split('T')[0]);
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
        <View style={styles.container}>
            <Text style={styles.header}>View Tasks</Text>
            {/* Calendar view with custom styles */}
            <View style={styles.dateItemsContainer}>
                {weekDates.map(date => renderDateItem(date))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
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
