import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const SecretWordGame = () => {
    const [gameStage, setGameStage] = useState('start');
    const [pickedWord, setPickedWord] = useState('');
    const [pickedCategory, setPickedCategory] = useState('');
    const [letters, setLetters] = useState([]);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongLetters, setWrongLetters] = useState([]);
    const [guesses, setGuesses] = useState(3);
    const [score, setScore] = useState(0);
    const letterInputRef = useRef(null);
    const wordsList = {
        animals: ['cat', 'dog', 'bird'],
        fruits: ['apple', 'banana', 'orange'],
    };

    const pickWordAndCategory = useCallback(() => {
        const categories = Object.keys(wordsList);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const word = wordsList[category][Math.floor(Math.random() * wordsList[category].length)];
        return { category, word };
    }, []);

    const startGame = useCallback(() => {
        clearLettersStates();
        const { category, word } = pickWordAndCategory();
        const wordLetters = word.split('');
        setPickedCategory(category);
        setPickedWord(word);
        setLetters(wordLetters);
        setGameStage('game');
    }, [pickWordAndCategory]);

    const verifyLetter = (letter) => {
        const normalizedLetter = letter.toLowerCase();
        if (guessedLetters.includes(normalizedLetter) || wrongLetters.includes(normalizedLetter)) {
            return;
        }
        if (letters.includes(normalizedLetter)) {
            setGuessedLetters([...guessedLetters, letter]);
        } else {
            setWrongLetters([...wrongLetters, normalizedLetter]);
            setGuesses((prevGuesses) => prevGuesses - 1);
        }
    };

    const retry = () => {
        setScore(0);
        setGuesses(3);
        setGameStage('start');
    };

    const clearLettersStates = () => {
        setGuessedLetters([]);
        setWrongLetters([]);
    };

    useEffect(() => {
        if (guesses === 0) {
            clearLettersStates();
            setGameStage('end');
        }
    }, [guesses]);

    useEffect(() => {
        const uniqueLetters = [...new Set(letters)];
        if (guessedLetters.length === uniqueLetters.length && gameStage === 'game') {
            setScore((prevScore) => prevScore + 100);
            startGame();
        }
    }, [guessedLetters, letters, gameStage, startGame]);

    const renderGameStage = () => {
        switch (gameStage) {
            case 'start':
                return (
                    <View style={styles.container}>
                        <Text style={styles.title}>Secret Word</Text>
                        <Text style={styles.instructions}>Click the button below to start playing</Text>
                        <TouchableOpacity style={styles.button} onPress={startGame}>
                            <Text style={styles.buttonText}>Start Game</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'game':
                return (
                    <View style={styles.container}>
                        <Text style={styles.title}>Guess the Word:</Text>
                        <Text style={styles.category}>Category: {pickedCategory}</Text>
                        <Text>You have {guesses} attempts left.</Text>
                        <View style={styles.wordContainer}>
                            {letters.map((letter, index) => (
                                <Text key={index} style={styles.letter}>
                                    {guessedLetters.includes(letter) ? letter : '_'}
                                </Text>
                            ))}
                        </View>
                        <Text>Try guessing a letter:</Text>
                        <TextInput
                            ref={letterInputRef}
                            style={styles.input}
                            maxLength={1}
                            onChangeText={(text) => verifyLetter(text)}
                            value={guessedLetters}
                        />
                        <View style={styles.wrongLettersContainer}>
                            <Text>Used letters: {wrongLetters.join(', ')}</Text>
                        </View>
                    </View>
                );
            case 'end':
                return (
                    <View style={styles.container}>
                        <Text style={styles.title}>Game Over!</Text>
                        <Text>Your score: {score}</Text>
                        <TouchableOpacity style={styles.button} onPress={retry}>
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    instructions: {
        fontSize: 16,
        marginBottom: 20,
    },
    category: {
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
    },
    input: {
        height: 40,
        width: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        textAlign: 'center',
    },
    wrongLettersContainer: {
        marginTop: 20,
    },
});

export default SecretWordGame;