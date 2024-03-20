import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, ImageBackground, Dimensions } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from './UserDataManager';
import { auth, db } from '../config/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';


// Get the width of the screen
const screenWidth = Dimensions.get('window').width;

// Dynamically calculate the width of the message container based on the screen width
const messageContainerWidth = screenWidth - 40; // Subtracting padding from both sides


const Game = () => {
    const navigation = useNavigation();
    const { userData } = useUserData();
    const [storedUserToken, setStoredUserToken] = useState(null);
    const [feelGoodMessage, setFeelGoodMessage] = useState('');
    const [isImageSelected, setIsImageSelected] = useState([false, false, false, false, false]);


    useEffect(() => {
        const fetchFeelGoodMessage = async () => {
            try {
                const storedQuote = await ReactNativeAsyncStorage.getItem('feelGoodQuote');
                const storedDate = await ReactNativeAsyncStorage.getItem('feelGoodQuoteDate');

                // Check if there is a stored quote for today
                if (storedQuote && storedDate === new Date().toISOString().split('T')[0]) {
                    // Truncate the stored quote if it exceeds 100 characters
                    const truncatedQuote = storedQuote.slice(0, 100);
                    setFeelGoodMessage(truncatedQuote);
                } else {
                    // Fetch the inspirational quote from the API
                    const response = await fetch(`https://favqs.com/api/qotd`);
                    const data = await response.json();

                    // Check if a quote is available for the date
                    if (data.quote) {
                        const quote = data.quote.body;
                        // Truncate the fetched quote if it exceeds 100 characters
                        const truncatedQuote = quote.slice(0, 100);
                        setFeelGoodMessage(truncatedQuote);
                        // Store the quote and its date
                        await ReactNativeAsyncStorage.setItem('feelGoodQuote', quote);
                        await ReactNativeAsyncStorage.setItem('feelGoodQuoteDate', new Date().toISOString().split('T')[0]);
                    } else {
                        setFeelGoodMessage("No quote available for this day.");
                    }
                }
            } catch (error) {
                console.error('Error fetching feel-good message:', error);
                setFeelGoodMessage("Failed to fetch quote.");
            }
        };

        // Fetch the feel-good message when the component mounts
        fetchFeelGoodMessage();

        const fetchSelectedEmoji = async () => {
            try {
                const storedIndex = await ReactNativeAsyncStorage.getItem('selectedEmoji');
                const storedDate = await ReactNativeAsyncStorage.getItem('selectedEmojiDate');

                // Check if there is a stored index for today
                if (storedIndex !== null && storedDate === new Date().toISOString().split('T')[0]) {
                    // Parse the stored index to an integer
                    const index = parseInt(storedIndex);
                    // Initialize a new array with all false values
                    const newSelectedState = Array(5).fill(false);
                    // Set the selected state for the retrieved index to true
                    newSelectedState[index] = true;
                    // Update the state
                    setIsImageSelected(newSelectedState);
                }
            } catch (error) {
                console.error('Error fetching selected emoji:', error);
            }
        };

        fetchSelectedEmoji();
    }, []);


    useEffect(() => {
        // console.log('User Data Changed:', userData);

        // Check if the storedUserToken is updated before logging
        if (storedUserToken !== null) {
            console.log('Stored User Token in PatientDashboard:', storedUserToken);
        }
    }, [userData, storedUserToken]);

    // Function to handle log out
    const handleLogout = async () => {
        // Clear user token and role from AsyncStorage
        await ReactNativeAsyncStorage.removeItem('userToken');
        await ReactNativeAsyncStorage.removeItem('userRole');

        // Navigate back to the login screen
        navigation.navigate('FirstScreen');
    };

    const handleImageSelection = async (index) => {
        // Check if the image is already selected for today
        if (!isImageSelected[index]) {
            try {
                // Create a reference to the user's document in the 'patient' collection
                const userDocRef = doc(db, 'patient', auth.currentUser.uid);

                // Define the mood data to be saved
                const moodData = {
                    MoodTracker: {
                        [Date.now().toString()]: {
                            mood: index,
                            date: new Date().toISOString().split('T')[0], // Current date
                            time: new Date().toISOString(), // Current time
                            weekCommencing: getMonday(new Date()).toISOString().split('T')[0], // Monday date of the current week
                        },
                    },
                };

                // Add the mood data to the 'MoodTracker' map within the user's document
                await setDoc(userDocRef, { MoodTracker: moodData }, { merge: true });

                // Update the selected state of the image
                setIsImageSelected((prevState) => {
                    const newState = prevState.map((selected, i) => (i === index ? !selected : false));
                    return newState;
                });

                // Store the selected emoji and its date
                await ReactNativeAsyncStorage.setItem('selectedEmoji', index.toString());
                await ReactNativeAsyncStorage.setItem('selectedEmojiDate', new Date().toISOString().split('T')[0]);
            } catch (error) {
                console.error('Error saving mood data:', error);
            }
        }
    };

    // Function to get the Monday date of the current week
    const getMonday = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(date.setDate(diff));
    };


    return (
        <ImageBackground source={require('../lgray.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleLogout} style={styles.logout}>
                    <Image source={require('../logout.png')} style={styles.logoutImg} />
                </TouchableOpacity>
                <Image source={require('../logotop.png')} style={styles.img} />
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.introduction}>Anxiety-Relief Game</Text>
                    <Text style={styles.text}>Test your reactions!</Text>
                    <Text style={styles.text}>Click on the boxes and circles</Text>
                    <Text style={styles.text}>as quick as you can!</Text>
                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('GamePlay')}>
                        <Text style={styles.btnText}>Start</Text>
                    </TouchableOpacity>
                </ScrollView>

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
        resizeMode: 'cover', // or 'stretch' if you want to stretch the image to fit
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent', // Set background color to transparent so that the image background is visible
        alignItems: 'center',
        justifyContent: 'flex-end', // Align content to the bottom of the screen
        paddingBottom: 50, // Adjust as needed to leave space at the bottom
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'SourceCodePro-Regular',
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
        marginTop: 15,
        width: 200,
        height: 50,
        marginBottom: 20,
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
        left: 1, // Adjust the right position as needed
    },
    logout: {
        position: 'absolute',
        top: 15,
        right: 15, // Adjust the right position as needed
    },
    logoutImg: {
        width: 50,
        height: 50,
    },
    functionalities: {
        flexDirection: 'row',
        padding: 10,
    },
    emojiButton: {
        width: 50,
        height: 50,
    },
    scrollContainer: {
        alignItems: 'center', // Center horizontally
        flexGrow: 1, // Ensure content takes up all available space vertically
        paddingTop: 120, // Adjust marginTop to position content at the top
    },
    introduction: {
        fontSize: 25,
        textAlign: 'center',
        color: '#0C5E51',
        fontFamily: 'SourceCodePro-Bold',
        marginBottom: 15,
    },
    feelGoodMessage: {
        fontSize: 13,
        textAlign: 'center',
        color: '#E0E0E0',
        fontFamily: 'SourceCodePro-Regular',
        padding: 15,
    },
    fellGoodMessageContainer: {
        width: 350,
        height: 94, // Fixed height
        justifyContent: 'center', // Align items horizontally in the center
        alignItems: 'center', // Align items vertically in the center
        marginBottom: 15,
    },
    emojiContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10,
        marginBottom: 15,
    },
});

export default Game;