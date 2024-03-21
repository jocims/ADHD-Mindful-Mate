import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, ScrollView, Image, Alert } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';


const windowWidth = Dimensions.get('window').width;


// Function to handle log out
const handleLogout = async () => {
    // Clear user token and role from AsyncStorage
    await ReactNativeAsyncStorage.removeItem('userToken');
    await ReactNativeAsyncStorage.removeItem('userRole');

    // Navigate back to the login screen
    navigation.navigate('FirstScreen');
};

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const Game = () => {
    const [shapeStyle, setShapeStyle] = useState({
        width: 0,
        height: 0,
        backgroundColor: 'red',
        display: 'none',
        position: 'absolute',
    });
    const [start, setStart] = useState(false); // State to track if the game has started
    const [startTimer, setStartTimer] = useState(0); // State to track the start time
    const [endTimer, setEndTimer] = useState(0); // State to track the end time
    const [timeTaken, setTimeTaken] = useState(0);
    const [timeTakenList, setTimeTakenList] = useState([]); // State to store all timeTaken values
    const [smallestTime, setSmallestTime] = useState(null); // State to store the smallest timeTaken value
    const [bestScore, setBestScore] = useState(null); // State to store the best score
    const navigation = useNavigation();


    const fetchBestScore = async () => {
        try {
            setBestScore(null);
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            const data = docSnap.data();
            if (data && data.GamePractice) {
                const scores = Object.values(data.GamePractice).map((entry) => entry.gamePracticeScore);
                const best = Math.min(...scores);
                setBestScore(best);
            }
        } catch (error) {
            console.error('Error fetching best score:', error);
        }
    };

    useEffect(() => {
        fetchBestScore();
    }, []);

    const handleStartGame = () => {
        setStart(true);
        setTimeTakenList([]);
        setSmallestTime(null);
        setTimeTaken(0);
        setStartTimer(new Date().getTime());
        makeShapeAppear(); // Start the game directly
    };

    const makeShapeAppear = () => {
        const containerWidth = windowWidth * 0.75;
        const containerHeight = containerWidth;

        const top = Math.random() * (containerHeight - 100);
        const left = Math.random() * (containerWidth - 100);
        const width = Math.random() * 100 + 50;
        const borderRadius = Math.random() > 0.5 ? 50 : 0;

        setShapeStyle({
            ...shapeStyle,
            borderRadius,
            backgroundColor: getRandomColor(),
            width,
            height: width,
            top,
            left,
            display: 'flex',
        });

        setStartTimer(new Date().getTime());
    };

    useEffect(() => {
        let timeoutId;
        if (start) {
            timeoutId = setTimeout(makeShapeAppear, Math.random() * 2000 + 2000);
        }
        return () => clearTimeout(timeoutId);
    }, [start]);

    const handleShapeClick = () => {
        setShapeStyle({
            ...shapeStyle,
            display: 'none',
        });

        const end = new Date().getTime();
        const taken = (end - startTimer) / 1000;
        setTimeTaken(taken);

        setTimeTakenList([...timeTakenList, taken]);

        setTimeout(makeShapeAppear, Math.random() * 2000 + 2000);
    };

    const handleEndGame = async () => {
        setStart(false);
        const endTime = new Date().getTime();
        setEndTimer(endTime);
        const duration = (endTime - startTimer) / 1000;

        const smallestTime = Math.min(...timeTakenList);
        setSmallestTime(smallestTime);

        try {
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);

            if (isFinite(smallestTime)) { // Check if smallestTime is a finite number
                const gameData = {
                    [Date.now().toString()]: {
                        gamePracticeScore: smallestTime,
                        date: new Date().toISOString().split('T')[0],
                        timeDurationOfPractice: duration.toFixed(2),
                        weekCommencing: getMonday(new Date()).toISOString().split('T')[0],
                    },
                };

                await setDoc(userDocRef, { GamePractice: gameData }, { merge: true });

            }

            // Fetch the best score again after updating the database
            await fetchBestScore();

            if (timeTakenList.length > 0) {
                if (bestScore < smallestTime && bestScore !== null) {
                    // Show scores in an alert
                    Alert.alert(
                        'Game Over',
                        `Your score: ${smallestTime}s\nBest score: ${bestScore}`
                    );
                } else {
                    Alert.alert(
                        'Game Over',
                        `Congratulations!\nNew best score: ${smallestTime}s`
                    );
                }
            }
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    };


    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
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
                            <Text style={styles.title}>Test Your Reactions!</Text>
                            <Text style={styles.title}>Click on the boxes and circles as quick as you can!</Text>
                            <Text style={styles.bold}>Your time: {timeTaken}s</Text>
                        </View>

                        <View style={styles.gameContainer}>
                            <TouchableOpacity style={[styles.shape, shapeStyle]} onPress={handleShapeClick} />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleEndGame}>
                                <Text style={styles.buttonText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.headerContainer}>

                            <Text style={styles.introduction}>Anxiety-Relief Game</Text>
                            <Text style={styles.text1}>Test your reactions!</Text>
                            <Text style={styles.text}>Click on the boxes and circles</Text>
                            <Text style={styles.text}>as quick as you can!</Text>
                            {isFinite(smallestTime) && smallestTime !== null && (
                                <Text style={styles.scores}>Last Score: {smallestTime.toFixed(3)}</Text>
                            )}
                            {isFinite(bestScore) && bestScore !== null && (
                                <Text style={styles.scores}>Best Score: {bestScore.toFixed(3)}</Text>
                            )}
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleStartGame}>
                            <Text style={styles.buttonText}>Start</Text>
                        </TouchableOpacity>
                    </>

                )}

                <TouchableOpacity style={styles.btnDashboard} onPress={() => navigation.navigate('PatientDashboard')}>
                    <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
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
        marginBottom: '25%',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
        marginBottom: 10,
    },
    text1: {
        fontSize: 18,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 10,
    },
    btn: {
        backgroundColor: '#AF3E76',
        borderRadius: 5,
        marginTop: 15,
        width: 200,
        height: 80,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    btnText: {
        fontSize: 20,
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
    scrollContainer: {
        alignItems: 'center',
        flexGrow: 1,
        paddingTop: 120,
    },
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 15,
    },
    title: {
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
    },
    bold: {
        fontFamily: 'SourceCodePro-Bold',
        color: 'black',
        fontSize: 16,
        marginTop: 5,
    },
    gameContainer: {
        borderWidth: 2,
        borderColor: 'black',
        width: '100%',
        aspectRatio: 1,
        marginBottom: 20,
        position: 'relative',
    },
    shape: {
        position: 'absolute',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
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
    scores: {
        marginTop: 15,
        fontSize: 18,
        fontFamily: 'SourceCodePro-Medium',
        color: 'black',

    },
});

export default Game;