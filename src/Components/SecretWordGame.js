import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const SecretWordGame = ({ selectedDate }) => {
    const [gameStage, setGameStage] = useState('start');
    const [startTimer, setStartTimer] = useState(0); // State to track the start time
    const [endTimer, setEndTimer] = useState(0); // State to track the end time
    const [pickedWord, setPickedWord] = useState('');
    const [pickedCategory, setPickedCategory] = useState('');
    const [previousWord, setPreviousWord] = useState(''); // State for the previous word
    const [letters, setLetters] = useState([]);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongLetters, setWrongLetters] = useState([]);
    const [guesses, setGuesses] = useState(3);
    const [score, setScore] = useState(0);
    const letterInputRef = useRef(null);
    const wordsList = {
        Animals: ['cat', 'dog', 'bird'],
        Fruits: ['apple', 'banana', 'orange'],
        Colors: ['red', 'blue', 'green'],
        Countries: ['ireland', 'canada', 'brazil'],
        Sports: ['soccer', 'basketball', 'tennis'],
        Professions: ['doctor', 'teacher', 'engineer'],
    };

    const pickWordAndCategory = useCallback((prevWord) => {
        let categories = Object.keys(wordsList);
        let category, word;
        do {
            category = categories[Math.floor(Math.random() * categories.length)];
            word = wordsList[category][Math.floor(Math.random() * wordsList[category].length)];
        } while (word === prevWord);
        return { category, word };
    }, []);

    const startGame = useCallback(() => {
        setStartTimer(new Date().getTime());
        clearLettersStates();
        const { category, word } = pickWordAndCategory(pickedWord);
        const wordLetters = word.split('');
        setPickedCategory(category);
        setPickedWord(word);
        setLetters(wordLetters);
        setGameStage('game');
        setGuesses(3);
    }, [pickWordAndCategory, pickedWord]);

    const verifyLetter = (letter) => {
        const normalizedLetter = letter.toLowerCase();
        if (guessedLetters.includes(normalizedLetter) || wrongLetters.includes(normalizedLetter)) {
            return;
        }
        if (letters.includes(normalizedLetter)) {
            // Add the correct letter to guessedLetters
            setGuessedLetters([...guessedLetters, normalizedLetter]);
            // Increment the score
            const newScore = score + 100; // Adjust score calculation as needed
            setScore(newScore);
            // Save the score in AsyncStorage
            ReactNativeAsyncStorage.setItem('secretWordGameScore', newScore.toString()).catch(error => console.error('Error saving score to AsyncStorage:', error));
        } else {
            setWrongLetters([...wrongLetters, normalizedLetter]);
            setGuesses((prevGuesses) => prevGuesses - 1);
        }
    };

    const handleEndGame = async () => {
        // Retrieve the score from AsyncStorage
        const storedScore = await ReactNativeAsyncStorage.getItem('secretWordGameScore');
        const scoreToSave = storedScore ? parseInt(storedScore, 10) : 0;

        const endTime = new Date().getTime();
        console.log('Start time:', startTimer);
        console.log('End time:', endTime);
        setEndTimer(endTime);
        const durationInSeconds = (endTime - startTimer) / 1000;
        console.log('Duration in seconds: ', durationInSeconds);
        const duration = Math.round((durationInSeconds / 60) * 100) / 100;
        console.log('Duration in minutes: ', duration);

        try {
            const userDocRef = doc(db, 'patient', auth.currentUser.uid);

            const id = Date.now().toString();
            const data = {
                [id]: {
                    id: id,
                    gamePracticeScore: scoreToSave,
                    game: 'Secret Word',
                    date: new Date().toLocaleDateString('en-GB'),
                    timeDurationOfPractice: duration.toFixed(2),
                    weekCommencing: getMonday(new Date()).toLocaleDateString('en-GB'),
                },
            };

            await setDoc(userDocRef, { GamePractice: data }, { merge: true });

        } catch (error) {
            console.error('Error saving game data:', error);
        }
        await ReactNativeAsyncStorage.removeItem('secretWordGameScore');
    };


    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    const clearLettersStates = () => {
        setGuessedLetters([]);
        setWrongLetters([]);
    };

    useEffect(() => {
        if (guesses === 0) {
            clearLettersStates();
            handleEndGame();
            setGameStage('end');
        }
    }, [guesses]);

    useEffect(() => {
        const uniqueLetters = [...new Set(letters)];
        if (guessedLetters.length === uniqueLetters.length && gameStage === 'game') {
            setScore((prevScore) => prevScore + 100);
            setPreviousWord(pickedWord); // Set the previous word
            startGame();
        }
    }, [guessedLetters, letters, gameStage, startGame]);

    useEffect(() => {
        // Start the game when the component mounts
        startGame();
    }, []); // Run only once when the component mounts

    const retryGame = () => {
        setScore(0);
        startGame();
        setPreviousWord(''); // Reset the previous word
    };


    const renderGameStage = () => {
        switch (gameStage) {
            case 'game':
                return (
                    <View style={styles.container}>
                        <Text style={styles.category}>Category: {pickedCategory}</Text>
                        <Text style={styles.instructions}>You have {guesses} attempts left.</Text>
                        <Text style={styles.instructions}>Try guessing a letter:</Text>
                        <TextInput
                            ref={letterInputRef}
                            style={styles.input}
                            maxLength={1}
                            onChangeText={(text) => {
                                verifyLetter(text);
                                letterInputRef.current.clear(); // Clear the text input after a letter is typed
                            }}
                            value="" // Always set the value to an empty string
                        />

                        <View style={styles.wordContainer}>
                            {letters.map((letter, index) => (
                                <Text key={index} style={styles.letter}>
                                    {guessedLetters.includes(letter) ? letter.toUpperCase() : '_'}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.wrongLettersContainer}>
                            <Text style={styles.instructions}>Used letters: {wrongLetters.join(', ').toUpperCase()}</Text>
                        </View>

                        {previousWord ? (
                            <View style={styles.wrongLettersContainer}>
                                <Text style={styles.instructions}>Previous word: {previousWord.toUpperCase()}</Text>
                            </View>
                        ) : null}
                    </View>
                );
            case 'end':
                return (
                    <View style={styles.container}>
                        <Text style={styles.title}>Game Over!</Text>
                        <Text style={styles.instructions}>The word was: {pickedWord.toUpperCase()}</Text>
                        <Text style={styles.category}>Your score: {score}</Text>
                        <TouchableOpacity style={styles.button} onPress={retryGame}>
                            <Text style={styles.buttonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return renderGameStage();
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'SourceCodePro-Bold',
        color: 'black',
        fontSize: 30,
        marginBottom: 20,
    },
    instructions: {
        fontFamily: 'SourceCodePro-Medium',
        color: 'black',
        fontSize: 16,
    },
    category: {
        fontSize: 20,
        fontFamily: 'SourceCodePro-Bold',
        color: 'black',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#af3e76',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    wordContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    letter: {
        fontSize: 24,
        marginRight: 5,
        color: 'black',
        fontFamily: 'SourceCodePro-Bold',
    },
    input: {
        fontFamily: 'SourceCodePro-Bold',
        height: 40,
        width: 40,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 20,
        marginTop: 20,
        textAlign: 'center',
        backgroundColor: 'white',
    },
    wrongLettersContainer: {
        fontFamily: 'SourceCodePro-Medium',
        color: 'black',
        marginTop: 20,
    },
});

export default SecretWordGame;