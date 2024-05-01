import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, PieChart } from 'react-native-chart-kit';


// Define the ViewTasksScreen component
const WeeklyReport = () => {
    // State variables
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [moodChartData, setMoodChartData] = useState(null);
    const [taskChartData, setTaskChartData] = useState(null);
    const route = useRoute();
    const patientToken = route.params?.patientToken;
    const { patientData } = route.params;
    const isDoctor = route.params?.isDoctor;
    const [deepBreathingChartData, setDeepBreathingChartData] = useState(null);
    const [gamePracticeChartData, setGamePracticeChartData] = useState(null);
    const [gameScoreChartData, setGameScoreChartData] = useState(null);
    const [gamePracticeChartData2, setGamePracticeChartData2] = useState(null);
    const [gameScoreChartData2, setGameScoreChartData2] = useState(null);
    const [meditationChartData, setMeditationChartData] = useState(null);

    useEffect(() => {
        if (patientData && patientData.WeeklyTasks) {
            const filteredWeeklyTasks = Object.values(patientData.WeeklyTasks)
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
        }
    }, [patientData]);

    useEffect(() => {
        if (patientData && patientData.MoodTracker) {
            const filteredMoodTrackerData = Object.values(patientData.MoodTracker)
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
        }
    }, [patientData, selectedDate]);

    useEffect(() => {
        if (patientData && patientData.GamePractice) {
            // Filter game practice and score data by the selected week commencing date
            const filteredGamePracticeData = Object.values(patientData.GamePractice)
                .filter(practice => filterByWeek(practice, startDate, endDate))
                .filter(entry => entry.game === 'Reaction Test'); // Filter only the Reaction Test game data

            // Initialize game practice and score data objects
            const gamePracticeData = {
                Mon: 0,
                Tue: 0,
                Wed: 0,
                Thu: 0,
                Fri: 0,
                Sat: 0,
                Sun: 0
            };
            const gameScoreData = {
                Mon: 0,
                Tue: 0,
                Wed: 0,
                Thu: 0,
                Fri: 0,
                Sat: 0,
                Sun: 0
            };

            // Aggregate game practice time and track the best score for each day
            filteredGamePracticeData.forEach((practice) => {
                const date = practice.date;
                const timeSpent = parseFloat(practice.timeDurationOfPractice);
                const score = parseFloat(practice.gamePracticeScore);
                const formattedDate = formatDate(date);

                gamePracticeData[formattedDate] += timeSpent;

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

            // Set the state with the updated chart data
            setGamePracticeChartData(gamePracticeChartData);
            setGameScoreChartData(gameScoreChartData);
        }
    }, [patientData, selectedDate]);

    useEffect(() => {
        if (patientData && patientData.GamePractice) {
            // Filter game practice and score data by the selected week commencing date
            const filteredGamePracticeData = Object.values(patientData.GamePractice)
                .filter(practice => filterByWeek(practice, startDate, endDate))
                .filter(entry => entry.game === 'Secret Word'); // Filter only the Reaction Test game data

            // Initialize game practice and score data objects
            const gamePracticeData = {
                Mon: 0,
                Tue: 0,
                Wed: 0,
                Thu: 0,
                Fri: 0,
                Sat: 0,
                Sun: 0
            };
            const gameScoreData = {
                Mon: 0,
                Tue: 0,
                Wed: 0,
                Thu: 0,
                Fri: 0,
                Sat: 0,
                Sun: 0
            };

            // Aggregate game practice time and track the best score for each day
            filteredGamePracticeData.forEach((practice) => {
                const date = practice.date;
                const timeSpent = parseFloat(practice.timeDurationOfPractice);
                const score = parseInt(practice.gamePracticeScore);
                const formattedDate = formatDate(date);

                gamePracticeData[formattedDate] += timeSpent;

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

            // Set the state with the updated chart data
            setGamePracticeChartData2(gamePracticeChartData);
            setGameScoreChartData2(gameScoreChartData);
        }
    }, [patientData, selectedDate]);

    useEffect(() => {
        if (patientData && patientData.Meditation) {
            // Filter meditation data by the selected week commencing date
            const filteredMeditation = Object.values(patientData.Meditation)
                .filter(practice => filterByWeek(practice, startDate, endDate))
            // Initialize meditation data object
            const meditationData = {
                Mon: 0,
                Tue: 0,
                Wed: 0,
                Thu: 0,
                Fri: 0,
                Sat: 0,
                Sun: 0
            };

            // Aggregate meditation duration for each day
            filteredMeditation.forEach((meditation) => {
                const date = meditation.date;
                const duration = parseFloat(meditation.timeDurationOfPractice);
                const formattedDate = formatDate(date);

                meditationData[formattedDate] += duration;
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

            // Set the state with the updated chart data
            setMeditationChartData(meditationChartData);
        }
    }, [patientData, selectedDate]);


    useEffect(() => {
        if (patientData && patientData.DeepBreathing) {
            const filteredDeepBreathing = Object.values(patientData.DeepBreathing)
                .filter(practice => filterByWeek(practice, startDate, endDate))

            // Initialize deep breathing data object
            const deepBreathingData = {
                Mon: 0,
                Tue: 0,
                Wed: 0,
                Thu: 0,
                Fri: 0,
                Sat: 0,
                Sun: 0
            };

            // Aggregate duration
            filteredDeepBreathing.forEach((breathing) => {
                const date = breathing.date;
                const duration = parseFloat(breathing.timeDurationOfPractice);

                // Convert date format to match the labels array format
                const formattedDate = formatDate(date);

                // Aggregate duration
                deepBreathingData[formattedDate] += duration;
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

            // Set the state with the updated chart data
            setDeepBreathingChartData(deepBreathingChartData);
        }
    }, [patientData, selectedDate]);



    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2, // Adjust as needed
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
                    {isDoctor && patientData && (
                        <View style={styles.personalDetails}>
                            <View style={styles.personalDetailsRow}>
                                <Text style={styles.labelName}>Patient Name: </Text>
                                <Text style={styles.labelValue}>{patientData.User.firstName + " " + patientData.User.lastName}</Text>
                            </View>
                            <View style={styles.personalDetailsRow}>
                                <Text style={styles.labelName}>Date of Birth: </Text>
                                <Text style={styles.labelValue}>{patientData.User.dob}</Text>
                            </View>
                            <View style={styles.personalDetailsRow}>
                                <Text style={styles.labelName}>Gender: </Text>
                                <Text style={styles.labelValue}>{patientData.User.gender}</Text>
                            </View>
                            <View style={styles.personalDetailsRow}>
                                <Text style={styles.labelName}>Weight: </Text>
                                <Text style={styles.labelValue}>{patientData.User.weight}Kg</Text>
                            </View>
                            <View style={styles.personalDetailsRow}>
                                <Text style={styles.labelName}>Mobile Number: </Text>
                                <Text style={styles.labelValue}>{formattedMobileNo(patientData.User.mobileNo)}</Text>
                            </View>
                            <View style={styles.personalDetailsRow}>
                                <Text style={styles.labelName}>Email: </Text>
                                <Text style={styles.labelValue}>{patientData.User.email}</Text>
                            </View>
                        </View>
                    )}

                    {patientData && patientData.WeeklyTasks && Object.values(patientData.WeeklyTasks)
                        .filter(task => task.weekCommencing >= getMonday(selectedDate))
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
                                    {patientData && patientData.WeeklyTasks && Object.values(patientData.WeeklyTasks)
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

                                {taskChartData && Object.values(patientData.WeeklyTasks)
                                    .length > 0 && (
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
                            </>
                        )}

                    {patientData && patientData.MoodTracker && Object.values(patientData.MoodTracker)
                        .filter(practice => filterByWeek(practice, startDate, endDate)) // Filter game practices by week commencing date range
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Mood Tracker</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Day</Text>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Time</Text>
                                        <Text style={styles.taskHeaderText}>Mood</Text>
                                    </View>
                                    {patientData && patientData.MoodTracker && Object.values(patientData.MoodTracker)
                                        .filter(practice => filterByWeek(practice, startDate, endDate)) // Filter game practices by week commencing date range
                                        .sort(sortByDateAndTime) // Sort by date and time
                                        .map((task, index) => (
                                            <View key={task.id || index} style={[styles.taskRowContainer, styles.taskRowLine]}>
                                                <Text style={styles.taskRowText}>{getDayOfWeek(task.date)}</Text>
                                                <Text style={styles.taskRowText}>{task.date}</Text>
                                                <Text style={styles.taskRowText}>{task.time}</Text>
                                                <Text style={styles.taskRowText}>{task.mood}</Text>
                                            </View>
                                        ))}
                                </View>

                                {moodChartData && Object.values(patientData.MoodTracker)
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
                            </>
                        )}


                    {patientData && patientData.GamePractice && gamePracticeChartData && gameScoreChartData && Object.values(patientData.GamePractice)
                        .filter(practice => filterByWeek(practice, startDate, endDate)) // Filter game practices by week commencing date range
                        .filter(entry => entry.game === 'Reaction Test')
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Anxiety-Relief Game Practices</Text>
                                    <Text style={styles.text2}>Reaction Test</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                        <Text style={styles.taskHeaderText}>Score</Text>
                                    </View>
                                    {patientData && patientData.GamePractice && Object.values(patientData.GamePractice)
                                        .filter(practice => filterByWeek(practice, startDate, endDate)) // Filter game practices by week commencing date range
                                        .filter(entry => entry.game === 'Reaction Test')
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
                                            formatYLabel={(value) => Math.round(value)}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                    {patientData && patientData.GamePractice && gamePracticeChartData && gameScoreChartData && Object.values(patientData.GamePractice)
                        .filter(practice => filterByWeek(practice, startDate, endDate)) // Filter game practices by week commencing date range
                        .filter(entry => entry.game === 'Secret Word') // Filter game practices for the "Secret Word" game
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text2}>Secret Word</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                        <Text style={styles.taskHeaderText}>Score</Text>
                                    </View>
                                    {Object.values(patientData.GamePractice)
                                        .filter(practice => filterByWeek(practice, startDate, endDate)) // Filter game practices by week commencing date range
                                        .filter(entry => entry.game === 'Secret Word') // Filter game practices for the "Secret Word" game
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
                                            data={gamePracticeChartData2}
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
                                            data={gameScoreChartData2}
                                            width={Dimensions.get("window").width * 0.45} // Adjust width to make the chart smaller
                                            height={180}
                                            chartConfig={chartConfig}
                                            bezier
                                            style={{
                                                borderRadius: 16,
                                                paddingLeft: 0, // Add some right padding to align the chart with the other chart
                                                paddingRight: 50, // Add some right padding to align the chart with the other chart
                                            }}
                                            formatYLabel={(value) => Math.round(value)}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                    {patientData && patientData.Meditation && meditationChartData && Object.values(patientData.Meditation)
                        .filter(meditation => filterByWeek(meditation, startDate, endDate)) // Filter meditations by week commencing date range
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Meditation Practice</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                    </View>
                                    {Object.values(patientData.Meditation)
                                        .filter(meditation => filterByWeek(meditation, startDate, endDate)) // Filter meditations by week commencing date range
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


                    {patientData && patientData.DeepBreathing && deepBreathingChartData && Object.values(patientData.DeepBreathing)
                        .filter(breathing => filterByWeek(breathing, startDate, endDate)) // Filter deep breathing exercises by week commencing date range
                        .length > 0 && (
                            <>
                                <View style={styles.taskDetailsContainer}>
                                    <Text style={styles.text1}>Deep-Breathing Exercises</Text>
                                    <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                        <Text style={styles.taskHeaderText}>Date</Text>
                                        <Text style={styles.taskHeaderText}>Duration (min)</Text>
                                    </View>
                                    {Object.values(patientData.DeepBreathing)
                                        .filter(breathing => filterByWeek(breathing, startDate, endDate)) // Filter deep breathing exercises by week commencing date range
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


                    {patientData && patientData.Journaling && Object.values(patientData.Journaling)
                        .filter(entry => filterByWeek(entry, startDate, endDate)) // Filter journal entries by week commencing date range
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Journal Entries</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Time</Text>
                                    <Text style={styles.taskHeaderText}>Entry</Text>
                                </View>
                                {Object.values(patientData.Journaling)
                                    .filter(entry => filterByWeek(entry, startDate, endDate)) // Filter journal entries by week commencing date range
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


                    {patientData && patientData.Notes && isDoctor && Object.values(patientData.Notes)
                        .filter(entry => filterByWeek(entry, startDate, endDate)) // Filter doctor's notes by week commencing date range
                        .length > 0 && (
                            <View style={styles.taskDetailsContainer}>
                                <Text style={styles.text1}>Doctor's Notes</Text>
                                <View style={[styles.taskHeaderContainer, styles.taskHeaderLine]}>
                                    <Text style={styles.taskHeaderText}>Date</Text>
                                    <Text style={styles.taskHeaderText}>Time</Text>
                                    <Text style={styles.taskHeaderText}>Entry</Text>
                                </View>
                                {Object.values(patientData.Notes)
                                    .filter(entry => filterByWeek(entry, startDate, endDate)) // Filter doctor's notes by week commencing date range
                                    .sort(sortByDateAndTime) // Sort by date and time
                                    .map((task, index) => (
                                        <View key={task.id || index} style={[styles.JournalingRowContainer, styles.taskRowLine]}>
                                            <Text style={styles.taskRowText}>{task.date}</Text>
                                            <Text style={styles.taskRowText}>{task.time}</Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    // Construct the message based on non-empty fields
                                                    let message = '';

                                                    if (task.date) {
                                                        message += `Date: ${task.date}\n`;
                                                    }
                                                    if (task.time) {
                                                        message += `Time: ${task.time}\n`;
                                                    }
                                                    if (task.patientDiagnosis) {
                                                        message += `Diagnosis: ${task.patientDiagnosis}\n`;
                                                    }
                                                    if (task.medication1) {
                                                        message += `Medication #1: ${task.medication1}\n`;
                                                    }
                                                    if (task.dosage1) {
                                                        message += `Dosage #1: ${task.dosage1}\n`;
                                                    }
                                                    if (task.medication2) {
                                                        message += `Medication #2: ${task.medication2}\n`;
                                                    }
                                                    if (task.dosage2) {
                                                        message += `Dosage #2: ${task.dosage1}\n`;
                                                    }
                                                    if (task.medication3) {
                                                        message += `Medication #3: ${task.medication3}\n`;
                                                    }
                                                    if (task.dosage3) {
                                                        message += `Dosage #3: ${task.dosage1}\n`;
                                                    }
                                                    if (task.identifiedPattern) {
                                                        message += `Identified Pattern: ${task.identifiedPattern}\n`;
                                                    }
                                                    if (task.treatmentNotes) {
                                                        message += `Treatment Notes: ${task.treatmentNotes}\n`;
                                                    }

                                                    if (message.trim() === '') {
                                                        message = 'No content available';
                                                    }

                                                    // Show the alert with the constructed message
                                                    Alert.alert(
                                                        'Notes',
                                                        message,
                                                        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
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

                {isDoctor && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Notes', { patientToken: patientToken, patientData: patientData, isDoctor: isDoctor })}
                            style={styles.button}>
                            <Text style={styles.buttonText}>Create Notes</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.dashboardBottomButtonContainer}>
                    <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate(isDoctor ? 'DoctorDashboard' : 'PatientDashboard')}>
                        <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const getMonday = (date) => {
    // Create a new Date object with the current date
    const currentDate = new Date();

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

export default WeeklyReport;