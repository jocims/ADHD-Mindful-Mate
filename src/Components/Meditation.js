import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Image, Modal } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './UserDataManager';
import DatePicker from 'react-native-date-picker'; // Import DatePicker

const windowWidth = Dimensions.get('window').width;

const Meditation = () => {
    const [start, setStart] = useState(false);
    const [startTimer, setStartTimer] = useState(0);
    const [meditations, setMeditations] = useState([]);
    const [selectedMeditation, setSelectedMeditation] = useState(null);
    const navigation = useNavigation();
    const { position, duration } = useProgress();
    const [isPlayerInitialized, setIsPlayerInitialized] = useState(false);
    const { updateUserData } = useUserData();
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [minimumDate, setMinimumDate] = useState(new Date());
    const [maximumDate, setMaximumDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);

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

    const cleanup = async () => {
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
        } catch (error) {
            console.error('Error stopping and resetting TrackPlayer:', error);
        }
    };

    useEffect(() => {
        // Function to initialize TrackPlayer
        const initializeTrackPlayer = async () => {
            console.log('!!!!!!!!!!!!!!!!!!!! Initializing TrackPlayer...');
            try {
                console.log('!!!!!!!!!!!!!!!!!!!! TRY...');

                const isPlayerInit = await TrackPlayer.isServiceRunning();
                setIsPlayerInitialized(isPlayerInit);

                if (!isPlayerInit) {
                    console.log('!!!!!!!!!!!!!!!!!!!! NOT INITIALIZED...');
                    await TrackPlayer.setupPlayer();
                    console.log('!!!!!!!!!!!!!!!!!!!! Player setup...');
                    setIsPlayerInitialized(true);
                    console.log('!!!!!!!!!!!!!!!!!!!! Player initialized...'); {
                    }
                } else {
                    console.log('!!!!!!!!!!!!!!!!!!!! Player already initialized...');
                    await TrackPlayer.reset();
                }
            } catch (error) {
                await TrackPlayer.reset();
                console.error('!!!!!!!!!!!!!!Error initializing TrackPlayer:', error);
            }
        };
        initializeTrackPlayer();
        fetchMeditations();
        return cleanup;
    }, []);

    useEffect(() => {
        const progressListener = TrackPlayer.addEventListener('playback-queue-ended', () => {
            setStart(false);
        });
        return () => {
            progressListener.remove();
        };
    }, []);

    const fetchMeditations = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'meditation-audios'));
            const meditationList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMeditations(meditationList);
            console.log('Fetched meditations:', meditationList);
        } catch (error) {
            console.error('Error fetching meditations:', error);
        }
    };

    // Function to start the meditation
    const handleMeditationStart = async (meditation) => {
        setSelectedMeditation(meditation);
        setStart(true);
        console.log('Starting meditation:', meditation.name);
        try {
            await TrackPlayer.reset();
            await TrackPlayer.add({
                id: meditation.id,
                url: meditation.url,
                title: meditation.name,
                artist: 'Meditation',
            });
            await TrackPlayer.play();

            setStartTimer(new Date().getTime());
        } catch (error) {
            console.error('Error playing meditation:', error);
        }
    };

    // Function to end the meditation
    const handleMeditationEnd = async () => {
        setStart(false);
        const endTime = new Date().getTime();
        const duration = (endTime - startTimer) / 1000 / 60;
        try {
            await TrackPlayer.stop();
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);
            const id = Date.now().toString();
            const data = {
                [id]: {
                    id: id,
                    meditationName: selectedMeditation.name,
                    timeDurationOfPractice: duration.toFixed(2),
                    date: startDate.toLocaleDateString('en-GB'),
                    weekCommencing: getMonday(new Date()).toLocaleDateString('en-GB'),
                },
            };

            await setDoc(userDocRef, { Meditation: data }, { merge: true });

        } catch (error) {
            console.error('Error stopping meditation:', error);
        }
        setStartDate(new Date());
        setStart(false);
    };

    const handleSeek = async (value) => {
        await TrackPlayer.seekTo(value);
    };

    const handleBackToDashboard = async () => {
        // Call cleanup function when navigating back to dashboard
        cleanup();

        updateUserData({ uid: auth.currentUser.uid });

        navigation.navigate('PatientDashboard');
    };

    // Function to get the Monday of the current week
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    // Function to handle logout
    const handleLogout = async () => {
        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');
        // Navigate back to the login screen
        navigation.navigate('FirstScreen');
    };

    return (
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
                            <Text style={styles.introduction}>Meditation</Text>
                            <Text style={styles.text}>{selectedMeditation.name}</Text>
                        </View>

                        <View style={styles.timerContainer}>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={duration}
                                value={position}
                                onSlidingComplete={handleSeek}
                                minimumTrackTintColor="#af3e76"
                                maximumTrackTintColor="#000000"
                                thumbTintColor="#af3e76"
                            />
                            <Text style={styles.timerText}>{formatTime(position)} / {formatTime(duration)}</Text>
                            {/* Display the timer and end button */}
                            <TouchableOpacity style={styles.endButton} onPress={handleMeditationEnd}>
                                <Text style={styles.endButtonText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        {/* Render meditation options if meditation hasn't started */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.introduction}>Meditation</Text>
                            <Text style={styles.text}>Choose a meditation option below:</Text>
                        </View>

                        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                            <Text style={styles.fieldLabel}>Start Date</Text>
                            <Text
                                style={styles.input}
                                onPress={() => setShowStartDatePicker(true)}
                            >
                                {startDate instanceof Date ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                            </Text>
                        </TouchableOpacity>

                        {showStartDatePicker && !start && ( // Conditionally render the modal containing the date picker
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={showStartDatePicker}
                                onRequestClose={() => setShowStartDatePicker(false)}
                            >
                                <View style={styles.modalContainer}>
                                    <View style={styles.modalContent}>
                                        <DatePicker
                                            date={startDate}
                                            onDateChange={setStartDate}
                                            mode="date"
                                            minimumDate={minimumDate}
                                            maximumDate={maximumDate}
                                        />
                                        <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                                            <Text>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                        )}

                        <View style={styles.meditationOptions}>
                            {/* Render meditation options */}
                            {meditations.map(meditation => (
                                <View key={meditation.id} style={styles.meditationOptionContainer}>
                                    <View style={styles.meditationInfo}>
                                        <Text style={styles.meditationName}>{meditation.name}</Text>
                                        <Text style={styles.meditationTime}>{meditation.time}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.startButton}
                                        onPress={() => handleMeditationStart(meditation)}
                                    >
                                        <Text style={styles.startButtonText}>Start</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                <TouchableOpacity style={styles.btnDashboard} onPress={handleBackToDashboard}>
                    <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
};

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20,
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
        alignItems: 'center',
        marginBottom: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: '10%',
        marginTop: '20%',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
        marginBottom: 10,
    },
    meditationOptions: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    meditationOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#af3e76',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 5,
        margin: 10,
        width: windowWidth - 40, // Adjust based on your design
    },
    meditationInfo: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    meditationName: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'SourceCodePro-Medium',
        flexWrap: 'wrap',
        marginRight: 10,
    },
    meditationTime: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'SourceCodePro-Regular',
    },
    startButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
    },
    startButtonText: {
        fontSize: 15,
        color: '#af3e76',
        fontFamily: 'SourceCodePro-Medium',
    },
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 15,
    },
    btnDashboard: {
        backgroundColor: '#052458',
        padding: 10,
        borderRadius: 5,
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '22.5%',
    },
    btnDashboardText: {
        fontSize: 15,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'SourceCodePro-Medium',
    },
    timerContainer: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        marginTop: 20,
    },
    timerText: {
        fontSize: 20,
        color: 'black',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 10,
    },
    endButton: {
        backgroundColor: '#af3e76',
        padding: 10,
        borderRadius: 5,
    },
    endButtonText: {
        fontSize: 15,
        color: 'white',
        fontFamily: 'SourceCodePro-Medium',
    },
    slider: {
        width: windowWidth * 0.75, // Adjust the width as needed
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
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
        textAlign: 'center',
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
});

export default Meditation;
