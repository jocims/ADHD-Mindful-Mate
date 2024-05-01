import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, ScrollView, Image, Alert, Vibration } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './UserDataManager';
import SecretWordGame from './SecretWordGame'; // Import the SecretWordGame component


const windowWidth = Dimensions.get('window').width;

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
    const [shapeClickStartTime, setShapeClickStartTime] = useState(0); // State to track the start time of each shape click
    const { updateUserData } = useUserData();
    const [selectedGame, setSelectedGame] = useState(null); // State to manage selected game
    const navigation = useNavigation();

    const BackToDashboard = async () => {
        if (auth.currentUser) {
            // Update user data context
            updateUserData({ uid: auth.currentUser.uid });
        }
        navigation.navigate('PatientDashboard');
    };


    const fetchBestScore = async () => {
        try {
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            const data = docSnap.data();
            if (data && data.GamePractice) {
                const gameScores = Object.values(data.GamePractice);
                const secretWordScores = gameScores
                    .filter(entry => entry.game === 'Secret Word')
                    .map(entry => entry.gamePracticeScore);
                const reactionTestScores = gameScores
                    .filter(entry => entry.game === 'Reaction Test')
                    .map(entry => entry.gamePracticeScore);
                const bestSecretWordScore = secretWordScores.length > 0 ? Math.max(...secretWordScores) : null;
                const bestReactionTestScore = reactionTestScores.length > 0 ? Math.max(...reactionTestScores) : null;
                setBestScore({
                    'Secret Word': bestSecretWordScore,
                    'Reaction Test': bestReactionTestScore
                });
            }
        } catch (error) {
            console.error('Error fetching best score:', error);
        }
    };

    const handleStartGame = (game) => {
        setSelectedGame(game);
        setStart(true);
        setStartTimer(new Date().getTime());
        setTimeTakenList([]);
        setSmallestTime(null);
        setTimeTaken(0);
        makeShapeAppear(); // Start the game directly
    };

    const makeShapeAppear = () => {
        const containerWidth = windowWidth * 0.75;
        const containerHeight = containerWidth;

        const top = Math.random() * (containerHeight - 100);
        const left = Math.random() * (containerWidth - 100);
        const width = Math.random() * 100 + 50;
        const borderRadius = Math.random() > 0.5 ? 50 : 0;

        setShapeClickStartTime(new Date().getTime());

        Vibration.vibrate();

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
        const taken = (end - shapeClickStartTime) / 1000;
        setTimeTaken(taken);

        setTimeTakenList([...timeTakenList, taken]);

        setTimeout(makeShapeAppear, Math.random() * 500 + 500);
    };

    const handleEndGame = async () => {
        setSelectedGame(null);
        setStart(false);
        const endTime = new Date().getTime();
        console.log('Start time:', startTimer);
        console.log('End time:', endTime);
        setEndTimer(endTime);
        const durationInSeconds = (endTime - startTimer) / 1000;
        console.log('Duration in seconds: ', durationInSeconds);
        const duration = Math.round((durationInSeconds / 60) * 100) / 100;
        console.log('Duration in minutes: ', duration);

        // Calculate the score inversely proportional to the time taken
        const minTime = Math.min(...timeTakenList);
        const score = isFinite(minTime) ? Math.round(1000 / minTime) : 0;

        try {
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);

            if (isFinite(score) && score > 0) { // Check if score is a finite number and greater than 0
                const id = Date.now().toString();
                const data = {
                    [id]: {
                        id: id,
                        gamePracticeScore: score, // Store the calculated score
                        game: 'Reaction Test',
                        date: new Date().toLocaleDateString('en-GB'),
                        timeDurationOfPractice: duration.toFixed(2),
                        weekCommencing: getMonday(new Date()).toLocaleDateString('en-GB'),
                    },
                };

                await setDoc(userDocRef, { GamePractice: data }, { merge: true });
            } else {
                console.log('Score is not greater than 0. Data not saved.');
            }

            // Fetch the best score again after updating the database
            await fetchBestScore();

        } catch (error) {
            console.error('Error saving game data:', error);
        }
    };

    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    // Function to handle log out
    const handleLogout = async () => {
        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');

        // Navigate back to the login screen
        navigation.navigate('FirstScreen');
    };

    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <ScrollView contentContainerStyle={styles.container}>

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

                        {selectedGame === 'ReactionTest' && (
                            <>
                                <View style={styles.header}>
                                    <Text style={styles.title}>Test Your Reactions!</Text>
                                    <Text style={styles.text}>Click on the boxes and circles as quick as you can!</Text>
                                    <Text style={styles.bold}>Your time: {timeTaken}s</Text>
                                </View>

                                <View style={styles.gameContainer}>
                                    <TouchableOpacity style={[styles.shape, shapeStyle]} onPress={handleShapeClick} />
                                </View>
                            </>
                        )}

                        {selectedGame === 'SecretWord' && (

                            <>
                                <View style={styles.header}>
                                    <Text style={styles.title}>Guess the word!</Text>
                                    <Text style={styles.text}>Enter a letter in the box to guess the secret word.</Text>
                                </View>

                                <View style={styles.gameContainer}>
                                    <SecretWordGame />
                                </View>
                            </>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleEndGame}>
                                <Text style={styles.buttonText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.gameOptions}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.introduction}>Anxiety-Relief Games</Text>

                            </View>

                            <View style={styles.gameOptionContainer}>
                                <View style={styles.gameInfo}>
                                    <Text style={styles.gameName}>Reaction Test</Text>
                                    <Text style={styles.gameDescription}>Be fast to click on the forms!</Text>
                                    {bestScore && bestScore['Reaction Test'] !== null && (
                                        <Text style={styles.gameDescription}>Best Score: {bestScore['Reaction Test']}</Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.startButton}
                                    onPress={() => handleStartGame('ReactionTest')}
                                >
                                    <Text style={styles.startButtonText}>Start</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.gameOptionContainer}>
                                <View style={styles.gameInfo}>
                                    <Text style={styles.gameName}>Secret Word</Text>
                                    <Text style={styles.gameDescription}>Guess the word!</Text>
                                    {bestScore && bestScore['Secret Word'] !== null && (
                                        <Text style={styles.gameDescription}>Best Score: {bestScore['Secret Word']}</Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.startButton}
                                    onPress={() => handleStartGame('SecretWord')}
                                >
                                    <Text style={styles.startButtonText}>Start</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </>
                )}

                <TouchableOpacity style={styles.btnDashboard} onPress={BackToDashboard}>
                    <Text style={styles.btnDashboardText}>Back to Dashboard</Text>
                </TouchableOpacity>
            </ScrollView>
        </ImageBackground >
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
        marginBottom: '10%',
        marginTop: '20%',
    },
    gameOptions: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    gameOptionContainer: {
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
    gameInfo: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    gameName: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'SourceCodePro-Medium',
        flexWrap: 'wrap',
        marginRight: 10,
    },
    gameDescription: {
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
    text: {
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
        marginTop: 10,
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
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Bold',
    },
    bold: {
        fontFamily: 'SourceCodePro-Bold',
        color: 'black',
        fontSize: 15,
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