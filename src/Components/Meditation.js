import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';

const windowWidth = Dimensions.get('window').width;

const Meditation = () => {
    const [start, setStart] = useState(false);
    const [meditations, setMeditations] = useState([]);
    const [selectedMeditation, setSelectedMeditation] = useState(null);
    const navigation = useNavigation();
    const { position, duration } = useProgress();
    const [isPlayerInitialized, setIsPlayerInitialized] = useState(false);

    useEffect(() => {
        // Function to initialize TrackPlayer
        const initializeTrackPlayer = async () => {
            if (!isPlayerInitialized) {
                await TrackPlayer.setupPlayer();
                setIsPlayerInitialized(true);
            }
        };
        initializeTrackPlayer();
        fetchMeditations();
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
        setStart(false);
        try {
            await TrackPlayer.stop();
        } catch (error) {
            console.error('Error stopping meditation:', error);
        }
    };

    const handleSeek = async (value) => {
        await TrackPlayer.seekTo(value);
    };

    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                {/* Conditionally render components based on the 'start' state */}
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

                {/* Logout button */}
                <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('PatientDashboard')}>
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
});

export default Meditation;
