import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { useUserData } from './UserDataManager';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, FieldValue, getDoc, setDoc } from 'firebase/firestore'; // Import the necessary functions
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, PieChart } from 'react-native-chart-kit';

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
    const [moodChartData, setMoodChartData] = useState(null);
    const [taskChartData, setTaskChartData] = useState(null);
    const gamePracticeData = {};
    const gameScoreData = {};
    const meditationData = {};
    const deepBreathingData = {};

    useEffect(() => {
        if (userData && userData.WeeklyTasks) {
            const filteredWeeklyTasks = Object.values(userData.WeeklyTasks)
                .filter(task => task.weekCommencing >= getMonday(selectedDate));

            // Initialize task status count object
            const taskStatusCount = {
                "Completed": 0,
                "Created": 0,
                "In Progress": 0,
                "Started": 0,
            };

            // Count task statuses
            filteredWeeklyTasks.forEach((task) => {
                const status = task.taskStatus;
                taskStatusCount[status]++;
            });

            // Define custom colors for each task status
            const taskStatusColors = {
                "Completed": '#0C5E51',
                "Created": '#053B90',
                "Started": '#D64F5D',
                "In Progress": '#5F6EB5',
            };

            // Calculate percentages and assign colors
            const totalTasks = filteredWeeklyTasks.length;
            const taskChartData = Object.keys(taskStatusCount).map((status) => {
                const percentage = (taskStatusCount[status] / totalTasks) * 100;
                const formattedPercentage = parseFloat(percentage.toFixed(1)); // Ensure percentage is a float with one decimal point
                return { name: '% ' + status, percentage: formattedPercentage, color: taskStatusColors[status] };
            });

            setTaskChartData(taskChartData);
            console.log("taskChartData:", JSON.stringify(taskChartData));
        }
    }, [userData]);



    useEffect(() => {
        if (userData && userData.MoodTracker) {
            const filteredMoodTrackerData = Object.values(userData.MoodTracker)
                .filter(task => task.weekCommencing >= getMonday(selectedDate));

            // Initialize mood count object
            const moodCount = {
                "Very Happy": 0,
                "Happy": 0,
                "Indifferent": 0,
                "Sad": 0,
                "Very Sad": 0
            };

            // Count mood occurrences
            filteredMoodTrackerData.forEach((entry) => {
                const mood = entry.mood;
                moodCount[mood]++;
            });

            // Define custom colors for each mood
            const moodColors = {
                "Very Happy": '#AF3E76',
                "Happy": '#5F6EB5',
                "Indifferent": '#0C5E51',
                "Sad": '#053B90',
                "Very Sad": '#D64F5D'
            };

            // Calculate percentages and assign colors
            const totalEntries = filteredMoodTrackerData.length;
            const moodChartData = Object.keys(moodCount).map((mood) => {
                const percentage = (moodCount[mood] / totalEntries) * 100;
                const formattedPercentage = parseFloat(percentage.toFixed(1)); // Ensure percentage is a float with one decimal point
                return { name: '% ' + mood, percentage: formattedPercentage, color: moodColors[mood] };
            });

            setMoodChartData(moodChartData);
            console.log("moodChartData:", JSON.stringify(moodChartData));
        }
    }, [userData, selectedDate]);

    // Filter game practice and score data by the selected week commencing date
    const filteredGamePracticeData = Object.values(userData.GamePractice)
        .filter(entry => entry.date >= getMonday(selectedDate));

    // Aggregate game practice time and track the best score for each day
    filteredGamePracticeData.forEach((practice) => {
        const date = practice.date;
        const timeSpent = parseFloat(practice.timeDurationOfPractice);
        const score = parseFloat(practice.gamePracticeScore);
        const formattedDate = formatDate(date);

        if (gamePracticeData[formattedDate]) {
            gamePracticeData[formattedDate] += timeSpent;
        } else {
            gamePracticeData[formattedDate] = timeSpent;
        }

        if (!gameScoreData[formattedDate] || score > gameScoreData[formattedDate]) {
            gameScoreData[formattedDate] = score;
        }
    });

    // Prepare data for the duration graph
    const gamePracticeChartData = {
        labels: ["M", "T", "W", "T", "F", "S", "S"],
        datasets: [
            {
                data: [
                    gamePracticeData["Mon"] || 0,
                    gamePracticeData["Tue"] || 0,
                    gamePracticeData["Wed"] || 0,
                    gamePracticeData["Thu"] || 0,
                    gamePracticeData["Fri"] || 0,
                    gamePracticeData["Sat"] || 0,
                    gamePracticeData["Sun"] || 0
                ],
            },
        ],
    };

    // Prepare data for the game score graph
    const gameScoreChartData = {
        labels: ["M", "T", "W", "T", "F", "S", "S"],
        datasets: [
            {
                data: [
                    gameScoreData["Mon"] || 0,
                    gameScoreData["Tue"] || 0,
                    gameScoreData["Wed"] || 0,
                    gameScoreData["Thu"] || 0,
                    gameScoreData["Fri"] || 0,
                    gameScoreData["Sat"] || 0,
                    gameScoreData["Sun"] || 0
                ],
            },
        ],
    };


    const filteredMeditation = Object.values(userData.Meditation)
        .filter(entry => entry.date >= getMonday(selectedDate));

    filteredMeditation.forEach((meditation) => {
        const date = meditation.date;
        const duration = parseFloat(meditation.timeDurationOfPractice);

        // Convert date format to match the labels array format
        const formattedDate = formatDate(date);

        // Aggregate duration
        if (meditationData[formattedDate]) {
            meditationData[formattedDate] += duration;
        } else {
            meditationData[formattedDate] = duration;
        }
    });

    // Prepare data for meditation chart
    const meditationChartData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: [
                    meditationData["Mon"] || 0,
                    meditationData["Tue"] || 0,
                    meditationData["Wed"] || 0,
                    meditationData["Thu"] || 0,
                    meditationData["Fri"] || 0,
                    meditationData["Sat"] || 0,
                    meditationData["Sun"] || 0
                ],
            },
        ],
    };

    console.log("meditationChartData:", JSON.stringify(meditationChartData));

    const filteredDeepBreathing = Object.values(userData.DeepBreathing)
        .filter(entry => entry.date >= getMonday(selectedDate));

    console.log("filteredDeepBreathing:", JSON.stringify(filteredDeepBreathing));

    // Prepare data for Deep-Breathing chart
    filteredDeepBreathing.forEach((breathing) => {
        const date = breathing.date;
        const duration = parseFloat(breathing.timeDurationOfPractice);

        // Convert date format to match the labels array format
        const formattedDate = formatDate(date);

        // Aggregate duration
        if (deepBreathingData[formattedDate]) {
            deepBreathingData[formattedDate] += duration;
        } else {
            deepBreathingData[formattedDate] = duration;
        }
    });

    // Prepare data for Deep-Breathing chart
    const deepBreathingChartData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: [
                    deepBreathingData["Mon"] || 0,
                    deepBreathingData["Tue"] || 0,
                    deepBreathingData["Wed"] || 0,
                    deepBreathingData["Thu"] || 0,
                    deepBreathingData["Fri"] || 0,
                    deepBreathingData["Sat"] || 0,
                    deepBreathingData["Sun"] || 0
                ],
            },
        ],
    };


    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2, // Adjust as needed
    };



    useEffect(() => {
        // Ensure that the updateUserData function is available
        if (updateUserData) {
            // Call the updateUserData function with the current user's UID
            updateUserData({ uid: auth.currentUser.uid });
        }
    }, []);

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
                        .filter(task => task.weekCommencing >= getMonday(selectedDate))
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
                                    .filter(task => task.weekCommencing >= getMonday(selectedDate))
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
                        )}

                    {taskChartData && Object.values(userData.WeeklyTasks).length > 0 && (
                        <View style={styles.chartContainer}>
                            <PieChart
                                data={taskChartData}
                                width={Dimensions.get("window").width * 0.9}
                                height={200}
                                chartConfig={{
                                    backgroundColor: '#FFFFFF',
                                    backgroundGradientFrom: '#FFFFFF',
                                    backgroundGradientTo: '#FFFFFF',
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="percentage"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        </View>
                    )}

                    {userData && userData.MoodTracker && Object.values(userData.MoodTracker)
                        .filter(entry => entry.date >= getMonday(selectedDate)) // Filter mood entries by week commencing date
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Mood Tracker</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Time</Text>
                                    <Text style={styles.taskHeaderText}>Mood</Text>
                                </View>
                                {userData && userData.MoodTracker && Object.values(userData.MoodTracker)
                                    .filter(entry => entry.date >= getMonday(selectedDate)) // Filter mood entries by week commencing date
                                    .sort(sortByDateAndTime) // Sort by date and time
                                    .map((task, index) => (
                                        <View key={task.id || index} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                            <Text style={styles.taskRowText}>{task.date}</Text>
                                            <Text style={styles.taskRowText}>{task.time}</Text>
                                            <Text style={styles.taskRowText}>{task.mood}</Text>
                                        </View>
                                    ))}
                            </View>
                        )}

                    {moodChartData && Object.values(userData.MoodTracker)
                        .length > 0 && (
                            <View style={styles.chartContainer}>
                                <PieChart
                                    data={moodChartData}
                                    width={Dimensions.get("window").width * 0.9}
                                    height={200}
                                    chartConfig={{
                                        backgroundColor: '#FFFFFF',
                                        backgroundGradientFrom: '#FFFFFF',
                                        backgroundGradientTo: '#FFFFFF',
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    }}
                                    accessor="percentage"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    absolute
                                />
                            </View>
                        )}

                    {userData && userData.GamePractice && Object.values(userData.GamePractice)
                        .filter(practice => practice.date >= getMonday(selectedDate)) // Filter game practices by week commencing date
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Anxiety-Relief Game Practice</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                        <Text style={styles.taskHeaderText}>Best time (sec)</Text>
                                    </View>
                                    {userData && userData.GamePractice && Object.values(userData.GamePractice)
                                        .filter(practice => practice.date >= getMonday(selectedDate)) // Filter game practices by week commencing date
                                        .sort(sortByDateAndDuration) // Sort by date and duration
                                        .map((task, index) => (
                                            <View key={task.id || index} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                                <Text style={styles.taskRowText}>{task.date}</Text>
                                                <Text style={styles.taskRowText}>{formattedTime(task.timeDurationOfPractice)}</Text>
                                                <Text style={styles.taskRowText}>{task.gamePracticeScore}</Text>
                                            </View>
                                        ))}
                                </View>

                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>By Duration</Text>
                                    <Text style={styles.taskHeaderText}>By Score</Text>
                                </View>


                                <View style={styles.chartContainer}>
                                    <View style={styles.chart}>
                                        <LineChart
                                            data={gamePracticeChartData}
                                            width={Dimensions.get("window").width * 0.45} // Adjust width to make the chart smaller
                                            height={180}
                                            chartConfig={chartConfig}
                                            bezier
                                            style={{
                                                borderRadius: 16,
                                                paddingLeft: 0, // Add some right padding to align the chart with the other chart
                                                paddingRight: 50, // Add some right padding to align the chart with the other chart
                                            }}
                                            formatYLabel={(value) => formattedTime(value)} // Use the formattedTime function here
                                        />
                                    </View>
                                    <View style={styles.chart}>
                                        <LineChart
                                            data={gameScoreChartData}
                                            width={Dimensions.get("window").width * 0.45} // Adjust width to make the chart smaller
                                            height={180}
                                            chartConfig={chartConfig}
                                            bezier
                                            style={{
                                                borderRadius: 16,
                                                paddingLeft: 0, // Add some right padding to align the chart with the other chart
                                                paddingRight: 50, // Add some right padding to align the chart with the other chart
                                            }}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                    {userData && userData.Meditation && Object.values(userData.Meditation)
                        .filter(meditation => meditation.date >= getMonday(selectedDate)) // Filter meditations by week commencing date
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Meditation Practice</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                    </View>
                                    {userData && userData.Meditation && Object.values(userData.Meditation)
                                        .filter(meditation => meditation.date >= getMonday(selectedDate)) // Filter meditations by week commencing date
                                        .sort(sortByDateAndDuration) // Sort by date and duration
                                        .map((task, index) => (
                                            <View key={task.id || index} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                                <Text style={styles.taskRowText}>{task.date}</Text>
                                                <Text style={styles.taskRowText}>{formattedTime(task.timeDurationOfPractice)}</Text>
                                            </View>
                                        ))}
                                </View>

                                <View style={styles.chartContainer}>
                                    <LineChart
                                        data={meditationChartData} // Use the data for meditation here
                                        width={Dimensions.get("window").width * 0.9} // Adjust width to make the chart smaller
                                        height={300}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={{
                                            borderRadius: 16,
                                        }}
                                        formatYLabel={(value) => formattedTime(value)} // Use the formattedTime function here
                                    />
                                </View>

                            </>
                        )}

                    {userData && userData.DeepBreathing && Object.values(userData.DeepBreathing)
                        .filter(breathing => breathing.date >= getMonday(selectedDate)) // Filter deep breathing exercises by week commencing date
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Deep-Breathing Exercises</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                    </View>
                                    {userData && userData.DeepBreathing && Object.values(userData.DeepBreathing)
                                        .filter(breathing => breathing.date >= getMonday(selectedDate)) // Filter deep breathing exercises by week commencing date
                                        .sort(sortByDateAndDuration) // Sort by date and duration
                                        .map((task, index) => (
                                            <View key={task.id || index} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                                <Text style={styles.taskRowText}>{task.date}</Text>
                                                <Text style={styles.taskRowText}>{formattedTime(task.timeDurationOfPractice)}</Text>
                                            </View>
                                        ))}
                                </View>

                                <View style={styles.chartContainer}>
                                    <LineChart
                                        data={deepBreathingChartData} // Use the data for Deep-Breathing here
                                        width={Dimensions.get("window").width * 0.9} // Adjust width to make the chart smaller
                                        height={300}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={{
                                            borderRadius: 16,
                                        }}
                                        formatYLabel={(value) => formattedTime(value)} // Use the formattedTime function here
                                    />
                                </View>
                            </>
                        )}

                    {userData && userData.Journaling && Object.values(userData.Journaling)
                        .filter(entry => entry.date >= getMonday(selectedDate)) // Filter journal entries by week commencing date
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Journal Entries</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Time</Text>
                                    <Text style={styles.taskHeaderText}>Entry</Text>
                                </View>
                                {userData && userData.Journaling && Object.values(userData.Journaling)
                                    .filter(entry => entry.date >= getMonday(selectedDate)) // Filter journal entries by week commencing date
                                    .sort(sortByDateAndTime) // Sort by date and time
                                    .map((task, index) => (
                                        <View key={task.id || index} style={[styles.JournalingRowContainer, styles.taskRowLine]}>
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
                                                style={[styles.viewEntryButton, styles.taskRowText]}
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
        backgroundColor: '#af3e76',
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
    chart: {
        flex: 1,
        marginHorizontal: 5,
        marginBottom: 20, // Add bottom margin to create space between the chart and screen edges
        backgroundColor: '#FFFFFF', // Add a background color to separate the charts visually
        borderRadius: 16, // Apply border radius to match the chart style
    },
});

export default WeeklyReport;