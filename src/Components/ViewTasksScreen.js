import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Image } from 'react-native';
import { useUserData } from './UserDataManager';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, FieldValue, getDoc, setDoc } from 'firebase/firestore'; // Import the necessary functions


// Define the ViewTasksScreen component
const ViewTasksScreen = () => {
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

    // Function to handle task selection
    const handleTaskSelection = (task) => {
        setSelectedTask(task);
        setTaskId(task.id); // Set the task ID
        console.log('%%%%%%%%%%%%selected task in handleTaskSelection: ' + taskId);
        setSelectedStatus(task.taskStatus); // Set selectedStatus to the status of the selected task
        console.log('selected task in handleTaskSelection: ' + task);
        setStart(true);
    };

    const renderSelectedTaskDetails = () => {
        let deadlineDate = parseDeadlineDate(selectedTask.taskDeadline);
        // Format the deadline date
        const formattedDeadline = `${deadlineDate.toLocaleDateString('en-GB')} ${deadlineDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;

        // Render the selected task details
        return (
            <View style={styles.selectedTaskContainer}>
                <Text style={styles.selectedTaskDetails}>Description: {selectedTask.taskDescription}</Text>
                <Text style={styles.selectedTaskDetails}>Start Date: {selectedTask.commecingDate}</Text>
                <Text style={styles.selectedTaskDetails}>Deadline: {formattedDeadline}</Text>
                <Text style={styles.selectedTaskDetails}>Status: {selectedTask.taskStatus}</Text>
                {/* Conditionally render completion date */}
                {selectedTask.taskDateCompleted && (
                    <Text style={styles.selectedTaskDetails}>Completion: {selectedTask.taskDateCompleted}</Text>
                )}
            </View>
        );
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

    // Function to determine if a task belongs to the selected date
    const isTaskForDate = (task, date) => {
        const taskDeadline = parseDeadlineDate(task.taskDeadline); // Parse the deadline date
        if (taskDeadline.toString() === 'Invalid Date') {
            console.error('Invalid task deadline:', task.taskDeadline);
            return false; // Return false if the deadline is invalid
        }
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

    // Function to render the task list with assigned IDs
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
            const textColor = task.taskStatus === 'Created' ? buttonColor : backgroundColor === '#A3F0FD' ? '#cbf3ff' : '#c6f1c6';
            const timeColour = task.taskStatus === 'Completed' ? backgroundColor : buttonColor === '#306191' ? '#306191' : '#055564';
            const deadlineTime = parseDeadlineDate(task.taskDeadline).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

            return (
                <TouchableOpacity key={task.id} onPress={() => handleTaskSelection(task)} style={[styles.taskButton, { backgroundColor }]}>
                    <View style={[styles.buttonTop, { backgroundColor: buttonColor, width: buttonTopWidth }]}></View>
                    <View style={{ flexDirection: 'row' }}>
                        {/* Set text color based on task status */}
                        <Text style={[styles.tasksNames, { color: textColor }]}>{task.taskName}</Text>
                        {/* Display the time */}
                        <Text style={[styles.taskTime, { color: timeColour }]}>{deadlineTime}</Text>
                    </View>
                </TouchableOpacity>
            );
        });
    };

    // Function to calculate the width of the buttonTop based on task status
    const calculateButtonTopWidth = (status) => {
        switch (status) {
            case 'Started':
                return '52%';
            case 'In Progress':
                return '72%';
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

    const handleStatusUpdate = async () => {
        if (selectedTask) { // Check if a task is selected
            // Check if the selected status is different from the current status
            if (selectedStatus !== selectedTask.taskStatus) {
                try {
                    const userDocRef = doc(db, 'patient', auth.currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        const weeklyTasks = userData.WeeklyTasks || {};
                        const taskToUpdate = Object.keys(weeklyTasks).find(key => weeklyTasks[key].taskName === selectedTask.taskName);
                        if (taskToUpdate) {
                            const updatedTaskData = {
                                ...weeklyTasks[taskToUpdate],
                                taskStatus: selectedStatus, // Update the task status
                                // Update the task completion date if status is "Completed"
                                taskDateCompleted: selectedStatus === 'Completed' ? new Date().toLocaleDateString('en-GB') : weeklyTasks[taskToUpdate].taskDateCompleted
                            };
                            weeklyTasks[taskToUpdate] = updatedTaskData;
                            await setDoc(userDocRef, { WeeklyTasks: weeklyTasks }, { merge: true });
                            alert('Task status updated successfully.');

                            // Update selectedTask state with new status and completion date
                            setSelectedTask(updatedTaskData);
                        } else {
                            alert('Selected task not found in database.');
                        }
                    } else {
                        alert('User data not found in database.');
                    }
                } catch (error) {
                    console.error('Error updating task status:', error);
                    alert('Error updating task status.');
                }
            }
        } else {
            alert('Please select a task.');
        }
    };

    const handleLogout = async () => {
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');
        navigation.navigate('FirstScreen');
    };

    // Render the component
    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>

                {start ? (
                    <>
                        <TouchableOpacity onPress={handleLogout} style={styles.logout}>
                            <Image source={require('../logout.png')} style={styles.logoutImg} />
                        </TouchableOpacity>
                        <Image source={require('../logotop.png')} style={styles.img} />

                        <View style={styles.selectedDateContainer}>
                            <Text style={styles.selectedDateText}>
                                {selectedTask.taskName}
                            </Text>
                        </View>

                        <View style={styles.taskDetailsContainer}>
                            {selectedTask && renderSelectedTaskDetails()}
                        </View>

                        <View style={styles.dropdownContainer}>
                            {selectedTask.taskStatus !== 'Completed' && (
                                <>
                                    <View style={[styles.input, styles.statusInput]}>
                                        <Picker
                                            selectedValue={selectedStatus}
                                            onValueChange={(itemValue, itemIndex) => setSelectedStatus(itemValue)}
                                            style={{ height: 50, width: 165, backgroundColor: 'transparent' }}
                                            itemStyle={{ fontFamily: 'SourceCodePro-Medium', color: 'white' }}
                                        >
                                            <Picker.Item label="Created" value="Created" />
                                            <Picker.Item label="Started" value="Started" />
                                            <Picker.Item label="In Progress" value="In Progress" />
                                            <Picker.Item label="Completed" value="Completed" />
                                        </Picker>
                                    </View>

                                    <TouchableOpacity style={styles.button} onPress={handleStatusUpdate}>
                                        <Text style={styles.buttonText}>Update Progress</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        <View style={styles.ViewTasksBtnContainer}>
                            <TouchableOpacity style={styles.ViewTasksBtn} onPress={() => { setStart(false); }}>
                                <Text style={styles.btnDashboardText}>View Tasks</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
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
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.taskContainer}>
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
                    </>
                )}

                <View style={styles.dashboardBottomButtonContainer}>
                    <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('PatientDashboard')}>
                        <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </ImageBackground >
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
    selectedDateContainer: {
        marginTop: 50,
        marginBottom: 30,
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
        marginTop: 10,
        marginBottom: 70,
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
        fontSize: 13,
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
    taskTime: {
        fontFamily: 'SourceCodePro-Regular',
        color: '#777', // Adjust color as needed
        marginLeft: 'auto', // Push the time to the rightmost end
    },
    selectedTaskContainer: {
        padding: 20,
        backgroundColor: '#DE8192',
        borderRadius: 10,
        marginTop: 20,
    },
    selectedTaskName: {
        fontFamily: 'SourceCodePro-Bold',
        fontSize: 18,
        color: '#8E225D',
    },
    selectedTaskDetails: {
        fontFamily: 'SourceCodePro-Regular',
        fontSize: 16,
        color: '#8E225D',
    },
    dashboardBottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingLeft: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20, // Add some padding if necessary
    },
    ViewTasksBtnContainer: {
        position: 'absolute',
        bottom: 70,
        width: '100%',
        paddingLeft: 40,
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
    button: {
        backgroundColor: '#8E225D',
        width: '50%',
        height: 61,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 20,
        margin: 10,
    },
    ViewTasksBtn: {
        backgroundColor: '#af3e76',
        padding: 10,
        borderRadius: 5,
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'SourceCodePro-Medium',
    },
    dropdownContainer: {
        margin: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'space-between',
        flexDirection: 'row'
    },
    fieldLabel: {
        fontSize: 18,
        color: '#8E225D',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 10,
    },
    input: {
        margin: 10,
        borderWidth: 3,
        borderColor: '#9D265C',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        fontFamily: 'SourceCodePro-Regular',
        color: 'black',
    },
    statusInput: {
        padding: 0,
    },
});

// Export the component
export default ViewTasksScreen;
