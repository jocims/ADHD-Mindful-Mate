import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { useUserData } from './UserDataManager';
import { auth, db } from '../config/firebase';

// Define the ViewTasksScreen component
const ViewTasksScreen = () => {
    // State variables
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const { userData } = useUserData();
    const [taskFilter, setTaskFilter] = useState('alphabetical');

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

    // Function to parse the deadline date string and return a Date object
    const parseDeadlineDate = (deadlineString) => {
        const parts = deadlineString.split(', '); // Split the string to separate date and time
        const dateString = parts[0]; // Get the date part
        const timeString = parts[1]; // Get the time part
        const dateParts = dateString.split('/'); // Split the date string into parts
        const timeParts = timeString.split(':'); // Split the time string into parts
        // Parse the parts and create a Date object
        const deadlineDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1], timeParts[0], timeParts[1]);
        return deadlineDate;
    };

    // Function to determine if a task belongs to the selected date
    const isTaskForDate = (task, date) => {
        const taskDeadline = parseDeadlineDate(task.taskDeadline); // Parse the deadline date
        return taskDeadline.toISOString().split('T')[0] === date.toISOString().split('T')[0];
    };

    // Function to handle date selection
    const handleDateSelection = (date) => {
        setSelectedDate(date);
    };

    // Function to handle filter selection
    const handleFilterChange = (filter) => {
        setTaskFilter(filter);
    };

    // Function to sort tasks alphabetically by task name
    const sortTasksAlphabetically = (tasks) => {
        return tasks.sort((a, b) => a.taskName.localeCompare(b.taskName));
    };

    // Function to sort tasks by deadline time
    const sortTasksByTime = (tasks) => {
        return tasks.sort((a, b) => parseDeadlineDate(a.taskDeadline) - parseDeadlineDate(b.taskDeadline));
    };

    const sortTasksByStatus = (tasks) => {
        return tasks.sort((a, b) => {
            const statusOrder = {
                'Created': 1,
                'Started': 2,
                'In Progress': 3,
                'Completed': 4
            };
            return statusOrder[a.taskStatus] - statusOrder[b.taskStatus];
        });
    };

    const renderTaskList = (tasks, taskStatus) => {
        let sortedTasks;
        if (taskFilter === 'alphabetical') {
            sortedTasks = sortTasksAlphabetically(tasks);
        } else if (taskFilter === 'time') {
            sortedTasks = sortTasksByTime(tasks);
        } else {
            sortedTasks = sortTasksByStatus(tasks);
        }

        return sortedTasks.map(task => {
            const { backgroundColor, buttonColor } = getTaskButtonStyle(selectedDate); // Get button colors
            const buttonTopWidth = calculateButtonTopWidth(task.taskStatus);
            // Determine text color based on task status
            const textColor = task.taskStatus === 'Created' ? buttonColor : backgroundColor === '#A3F0FD' ? '#A3F0FD' : '#c6f1c6';
            return (
                <TouchableOpacity key={task.taskName} onPress={() => console.log('Task clicked:', task.taskName)} style={[styles.taskButton, { backgroundColor }]}>
                    <View style={[styles.buttonTop, { backgroundColor: buttonColor, width: buttonTopWidth }]}></View>
                    {/* Set text color based on task status */}
                    <Text style={[styles.tasksNames, { color: textColor }]}>{task.taskName}</Text>
                </TouchableOpacity>
            );
        });
    };


    // Function to calculate the width of the buttonTop based on task status
    const calculateButtonTopWidth = (status) => {
        switch (status) {
            case 'Started':
                return '43%';
            case 'In Progress':
                return '62%';
            case 'Completed':
                return '106%';
            default:
                return '2%'; // Default to 2% if status is not recognized
        }
    };

    // Return null if weekDates is empty
    if (weekDates.length === 0) {
        return null;
    }

    // Function to determine the background color and text color based on the day of the week
    const getTaskButtonStyle = (date) => {
        const day = date.getDay();
        let backgroundColor, buttonColor;

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

                {/* Filter buttons */}
                <View style={styles.filterContainer}>
                    <Text style={styles.sortText}>Sort by: </Text>
                    <TouchableOpacity onPress={() => handleFilterChange('alphabetical')} style={[styles.filterButton, taskFilter === 'alphabetical' && styles.activeFilter]}>
                        <Text style={[styles.filterButtonText, taskFilter === 'alphabetical' && styles.activeFilterText]}>A - Z</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleFilterChange('time')} style={[styles.filterButton, taskFilter === 'time' && styles.activeFilter]}>
                        <Text style={[styles.filterButtonText, taskFilter === 'time' && styles.activeFilterText]}>Time</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleFilterChange('status')} style={[styles.filterButton, taskFilter === 'status' && styles.activeFilter]}>
                        <Text style={[styles.filterButtonText, taskFilter === 'status' && styles.activeFilterText]}>Status</Text>
                    </TouchableOpacity>
                </View>

                {/* Task container */}
                <ScrollView style={styles.taskContainer}>
                    {weekDates.map(date => {
                        const tasksForDate = userData?.WeeklyTasks && Object.values(userData.WeeklyTasks).filter(task => {
                            return isTaskForDate(task, date);
                        });

                        if (selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0]) {
                            return tasksForDate && renderTaskList(tasksForDate);
                        }
                        return null;
                    })}
                </ScrollView>
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
        padding: 10,
    },
    taskButton: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        marginTop: 5,
        paddingStart: 10,
        position: 'relative', // Add position relative to the taskButton
    },
    buttonTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%', // Set width to 100%
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderTopRightRadius: 5, // Add border radius to create a diagonal effect
        borderBottomRightRadius: 5, // Add border radius to create a diagonal effect
    },
    tasksNames: {
        fontFamily: 'SourceCodePro-Bold', // Apply font family here
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 10,
    },
    filterButton: {
        backgroundColor: '#5F6EB5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    filterButtonText: {
        color: 'white',
        fontFamily: 'SourceCodePro-Bold',
    },
    activeFilter: {
        backgroundColor: '#5D507B',
    },
    activeFilterText: {
        color: 'white',
    },
    sortText: {
        fontFamily: 'SourceCodePro-Medium',
        fontSize: 16,
        color: '#5D507B',
        marginTop: 7,
    },
});

// Export the component
export default ViewTasksScreen;
