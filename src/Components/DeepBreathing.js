import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Image, Alert } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import breathingGif from '../breathing.gif';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { useProgress } from 'react-native-track-player';


const windowWidth = Dimensions.get('window').width;

const DeepBreathing = () => {
    const [start, setStart] = useState(false);
    const [startAudio, setstartAudio] = useState(false);
    const [startTimer, setStartTimer] = useState(0);
    const navigation = useNavigation();
    const [meditations, setMeditations] = useState([]);
    const { position, duration } = useProgress();
    const [isPlayerInitialized, setIsPlayerInitialized] = useState(false);
    const [selectedMeditation, setSelectedMeditation] = useState(null);

    const cleanup = async () => {
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
        } catch (error) {
            console.error('Error stopping and resetting TrackPlayer:', error);
        }
    };


    // Function to handle logout
    const handleLogout = async () => {
        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');
        // Navigate back to the login screen
        navigation.navigate('FirstScreen');
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
            setstartAudio(false);
        });
        return () => {
            progressListener.remove();
        };
    }, []);

    const fetchMeditations = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'deep-breathing-audios'));
            const meditationList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMeditations(meditationList);
            console.log('Fetched meditations:', meditationList);
        } catch (error) {
            console.error('Error fetching meditations:', error);
        }
    };

    const handleSeek = async (value) => {
        await TrackPlayer.seekTo(value);
    };

    const handleBackToDashboard = async () => {
        // Call cleanup function when navigating back to dashboard
        cleanup();
        navigation.navigate('PatientDashboard');
    };


    // Function to handle start of deep breathing
    const handleStart = () => {
        setStart(true);
        setStartTimer(new Date().getTime());
    };

    // Function to handle end of deep breathing
    const handleEnd = async () => {
        setStart(false);
        const endTime = new Date().getTime();
        const duration = (endTime - startTimer) / 1000;

        try {
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);
            const data = {
                [Date.now().toString()]: {
                    timeDurationOfPractice: duration.toFixed(2),
                    date: new Date().toISOString().split('T')[0],
                    weekCommencing: getMonday(new Date()).toISOString().split('T')[0],
                },
            };

            await setDoc(userDocRef, { DeepBreathing: data }, { merge: true });

        } catch (error) {
            console.error('Error saving deep breathing data:', error);
        }
    };

    // Function to get the Monday of the current week
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    // Function to start the meditation
    const handleMeditationStart = async (meditation) => {
        setSelectedMeditation(meditation);
        setstartAudio(true);
        setStartTimer(new Date().getTime());
        console.log('Starting meditation:', meditation);
        try {
            await TrackPlayer.reset();
            await TrackPlayer.add({
                id: meditation.id,
                url: meditation.url,
                title: meditation.name,
                artist: 'Meditation',
            });
            await TrackPlayer.play();
        } catch (error) {
            console.error('Error playing meditation:', error);
        }
    };

    // Function to end the meditation
    const handleMeditationEnd = async () => {
        setstartAudio(false);
        const endTime = new Date().getTime();
        const duration = (endTime - startTimer) / 1000;
        try {
            await TrackPlayer.stop();
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);
            const data = {
                [Date.now().toString()]: {
                    timeDurationOfPractice: duration.toFixed(2),
                    date: new Date().toISOString().split('T')[0],
                    weekCommencing: getMonday(new Date()).toISOString().split('T')[0],
                },
            };

            await setDoc(userDocRef, { DeepBreathing: data }, { merge: true });

        } catch (error) {
            console.error('Error stopping meditation:', error);
        }
    };

    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                {start || startAudio ? null : (
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
                            <Text style={styles.introduction}>Deep Breathing Technique</Text>
                            <Text style={styles.text}>Perform deep breathing to relax</Text>
                        </View>

                        <View style={styles.exerciseContainer}>
                            <Image source={breathingGif} resizeMode="contain" style={styles.shape} />
                        </View>

                        <View>
                            <TouchableOpacity style={styles.button} onPress={handleEnd}>
                                <Text style={styles.buttonText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : startAudio ? (
                    <>
                        <View style={styles.header}>
                            <Text style={styles.introduction}>Deep Breathing Technique</Text>
                            <Text style={styles.text}>{selectedMeditation.name}</Text>
                        </View>

                        <View style={styles.timerContainer}>

                            <Text style={styles.timerText}>{formatTime(position)} / {formatTime(duration)}</Text>
                            {/* Display the timer and end button */}
                            <TouchableOpacity style={styles.endButton} onPress={handleMeditationEnd}>
                                <Text style={styles.endButtonText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    </>

                ) : (

                    <>

                        <View style={styles.headerContainer}>
                            <Text style={styles.introduction}>Deep Breathing Technique</Text>
                            <Text style={styles.text}>Perform deep breathing to relax</Text>

                        </View>

                        <View style={styles.meditationOptions}>

                            <View style={styles.meditationOptionContainer}>
                                <View style={styles.meditationInfo}>
                                    <Text style={styles.meditationName}>Box Breathing Animation</Text>
                                    <Text style={styles.meditationTime}>To slow down your breathing</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.startButton}
                                    onPress={handleStart}
                                >
                                    <Text style={styles.startButtonText}>Start</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Render meditation options */}
                            {meditations.map(meditation => (
                                <View key={meditation.id} style={styles.meditationOptionContainer}>
                                    <View style={styles.meditationInfo}>
                                        <Text style={styles.meditationName}>{meditation.name}</Text>
                                        <Text style={styles.meditationTime}>{meditation.type}</Text>
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

                        <View style={{ marginTop: '15%' }}>
                        </View>


                    </>
                )}

                <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('PatientDashboard')}>
                    <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground >
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
        justifyContent: 'flex-end',
        padding: 20,
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
    },
    btnDashboardText: {
        fontSize: 15,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'SourceCodePro-Medium',
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
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 15,
    },
    exerciseContainer: {
        borderWidth: 2,
        width: '100%',
        aspectRatio: 1,
        marginBottom: 20,
        position: 'relative',
    },
    shape: {
        position: 'absolute',
        width: '100%', // Adjust the width to fill the container
        height: '100%', // Adjust the height to fill the container
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
    button: {
        backgroundColor: '#af3e76',
        width: '30%',
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
});

export default DeepBreathing;

